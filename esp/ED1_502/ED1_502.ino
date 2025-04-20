#include <WiFi.h>
#include <ArduinoWebsockets.h>
#include <ArduinoJson.h>


#include <ModbusMaster.h>
using namespace websockets;
ModbusMaster node;

#define RX0 16  // ESP32 RX pin (connect to RS485 TX)
#define TX0 17  // ESP32 TX pin (connect to RS485 RX)

///////////////////////////////////////////////////////////////////////
const uint8_t EM2M_ID = 1;
float energy =0.0;

////////////pir
int sensor = 22; 
int val;
bool pir_state;
static bool lastPirState = false;
bool currentPirState=false;

// Function to combine two 16-bit registers into a float
float combineRegistersToFloat(uint16_t regHigh, uint16_t regLow) {
  uint32_t combined = ((uint32_t)regHigh << 16) | regLow;
  float result;
  memcpy(&result, &combined, sizeof(result)); 
  return result;
}
///////////////////////////////////////////////////////////////////////
void onEventsCallback(WebsocketsEvent event, String data);




// Wi-Fi credentials
const char* ssid = "IITBhilai"; // Update with your Wi-Fi SSID
const char* password = "iitbhilai"; // Update with your Wi-Fi Password

// WebSocket server URL
const char* websocketServer = "wss://design-project-rgml.onrender.com/"; // Replace with your server IP

const char echo_org_ssl_ca_cert[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
MIICCTCCAY6gAwIBAgINAgPlwGjvYxqccpBQUjAKBggqhkjOPQQDAzBHMQswCQYD
VQQGEwJVUzEiMCAGA1UEChMZR29vZ2xlIFRydXN0IFNlcnZpY2VzIExMQzEUMBIG
A1UEAxMLR1RTIFJvb3QgUjQwHhcNMTYwNjIyMDAwMDAwWhcNMzYwNjIyMDAwMDAw
WjBHMQswCQYDVQQGEwJVUzEiMCAGA1UEChMZR29vZ2xlIFRydXN0IFNlcnZpY2Vz
IExMQzEUMBIGA1UEAxMLR1RTIFJvb3QgUjQwdjAQBgcqhkjOPQIBBgUrgQQAIgNi
AATzdHOnaItgrkO4NcWBMHtLSZ37wWHO5t5GvWvVYRg1rkDdc/eJkTBa6zzuhXyi
QHY7qca4R9gq55KRanPpsXI5nymfopjTX15YhmUPoYRlBtHci8nHc8iMai/lxKvR
HYqjQjBAMA4GA1UdDwEB/wQEAwIBhjAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQW
BBSATNbrdP9JNqPV2Py1PsVq8JQdjDAKBggqhkjOPQQDAwNpADBmAjEA6ED/g94D
9J+uHXqnLrmvT/aDHQ4thQEd0dlq7A/Cr8deVl5c1RxYIigL9zC2L7F8AjEA8GE8
p/SgguMh1YQdc4acLa/KNJvxn7kjNuK8YAOdgLOaVsjh4rsUecrNIdSUtUlD
-----END CERTIFICATE-----
)EOF";

WebsocketsClient client;
unsigned long lastSendTime = 0;

// GPIO pin mappings for channels
const int channelPins[] = {4, 0, 2, 15}; //16->1

// Handle incoming WebSocket messages
void onMessageCallback(WebsocketsMessage message) 
{
  Serial.print("Received: ");
  Serial.println(message.data());

  
  String rawData = message.data();
  int jstart= rawData.indexOf("{");
 

  if (jstart == -1)
  {
    Serial.println("No valid Json Msg found");
  }

  String Jstring= rawData.substring(jstart);

  StaticJsonDocument<300> jsonDoc; // Adjust size as needed
  DeserializationError error = deserializeJson(jsonDoc, Jstring);

  if (error) {
    Serial.print("Failed to parse incoming JSON: ");
    Serial.println(error.c_str());
    return;
  }

  // Check and toggle channels based on received data
  if (jsonDoc.containsKey("deviceId") && jsonDoc["deviceId"] == "Scitech") 
  {
    for (int i = 0; i < 4; i++) {
      String channelKey = "setChannel" + String(i + 1);
      if (jsonDoc.containsKey(channelKey)) {
        bool state = jsonDoc[channelKey];
        digitalWrite(channelPins[i], state ? LOW : HIGH);
        Serial.printf("Channel %d set to %s\n", i + 1, state ? "ON" : "OFF");
      }
    }
  }
}



void setup() 
{
  Serial.begin(115200);


  ////////////////////////////////////////////////////////////////////////////////
  

  Serial2.begin(9600, SERIAL_8N1, RX0, TX0);  // RX=GPIO16, TX=GPIO17
  node.begin(EM2M_ID, Serial2);
  readEnergy();
  currentPirState = digitalRead(sensor);

  ////////////////////////////////////////////////////////////////////////////////
  pinMode(sensor, INPUT); 
  // Configure GPIO pins for channels
  for (int i = 0; i < 4; i++) 
  {
    pinMode(channelPins[i], OUTPUT);
  }


  connectToWiFi();

  client.onMessage(onMessageCallback);
  client.onEvent(onEventsCallback);
  client.setCACert(echo_org_ssl_ca_cert);

  Serial.print("Connecting to WebSocket server...");
  if (client.connect(websocketServer)) {
    Serial.println("Connected!");
  } else {
    Serial.println("Failed to connect to WebSocket server");
  }
  digitalWrite(2, HIGH); // Initialize all channels as OFF
  digitalWrite(4, HIGH); // Initialize all channels as OFF
  digitalWrite(0, HIGH); // Initialize all channels as OFF
  digitalWrite(15, HIGH); // Initialize all channels as OFF


  delay(1000);
}

void loop() {
  checkWiFiConnection();
  checkWebSocketConnection();

  if (client.available()) 
  {
    client.poll();
  }

  if (millis() - lastSendTime > 1000) 
  { 
    readEnergy();
    lastSendTime = millis();
  }

  currentPirState = digitalRead(sensor);
  if (currentPirState != lastPirState) {
    lastPirState = currentPirState;
    val = currentPirState;   // for sendJson() logic
    sendJson();              // Immediately push PIR change
    Serial.println("PIR state changed. Sent immediate update.");
  }

  
  // delay(1000);

  

  if (millis() - lastSendTime > 60000) { // Send JSON every 1 minute
    sendJson();
    lastSendTime = millis();
  }
}

void sendJson() {
  StaticJsonDocument<300> jsonDoc;
  jsonDoc["deviceId"] = "Scitech";
  jsonDoc["energy"] = energy;

  // Send the actual state (true = ON, false = OFF)
  for (int i = 0; i < 4; i++) {
    jsonDoc["channel" + String(i + 1)] = digitalRead(channelPins[i]) == LOW;
  }

  if (val==HIGH)
  {
    jsonDoc["pirValue"] = true;
  }
  else
  {
    jsonDoc["pirValue"] = false;
  }
  // jsonDoc["pirValue"] = true;


  String jsonPayload;
  serializeJson(jsonDoc, jsonPayload);

  if (client.available()) {
    client.send(jsonPayload);
    Serial.println("Sent JSON: " + jsonPayload);
  } else {
    Serial.println("Cannot send JSON. WebSocket not connected.");
  }
}


void connectToWiFi() {
  Serial.print("Connecting to Wi-Fi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nConnected to Wi-Fi");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void checkWiFiConnection() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi disconnected. Reconnecting...");
    connectToWiFi();
  }
}

void readEnergy() {
    uint8_t result;    // for Modbus function call result status

  // **Read Total Energy (kWh) from registers 30001–30002**
  result = node.readInputRegisters(0x01, 0x02);  // read 2 registers starting at 30001
  if (result == node.ku8MBSuccess) {
    uint16_t highWord = node.getResponseBuffer(0);  // high 16 bits
    uint16_t lowWord  = node.getResponseBuffer(1);  // low 16 bits
    energy = combineRegistersToFloat(highWord, lowWord);
  }
   else {
    Serial.println("Failed to read Energy (kWh) register!");
  }
  delay(100);  // short delay between requests for reliability


  // Print the readings in a clear format
  Serial.print("Total Energy: ");
  Serial.print(energy, 2);
  Serial.println(" kWh");
  // delay(1000);
}

void checkWebSocketConnection() {
  if (!client.available()) {
    Serial.println("WebSocket disconnected. Reconnecting...");
    delay(2000);
    if (client.connect(websocketServer)) {
      Serial.println("Reconnected to WebSocket!");
    } else {
      Serial.println("WebSocket reconnection failed.");
    }
  }
}

void onEventsCallback(WebsocketsEvent event, String data) {
  if (event == WebsocketsEvent::ConnectionOpened) {
    Serial.println("WebSocket connection opened");
  } else if (event == WebsocketsEvent::ConnectionClosed) {
    Serial.println("WebSocket connection closed");
  } else if (event == WebsocketsEvent::GotPing) {
    Serial.println("Received a Ping!");
    client.pong();
  } 
}
