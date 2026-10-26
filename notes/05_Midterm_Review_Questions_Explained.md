# 📝 官方 Midterm Review Questions（28 題）詳解

> 教授 20 Oct 堂上逐題講解嘅思路已經整合入每題解釋。🗣️ 「我唔係淨係話你知答案係 A 定 B，而係教你點樣揀。」
> 想互動做題（即時對答案、記錄錯題）→ 去 **✍️ 官方 Review Questions（互動）**。

## Q1. Which devices will create multiple collision domains in an Ethernet network? (Choose two.)

- **A.** NIC
- **B.** hub
- ✅ **C.** **switch**
- ✅ **D.** **router**
- **E.** repeater

**答案：C, D**

💡 **Layer 2（switch）同 Layer 3（router）**嘅每個 interface 都係一個獨立 collision domain → 會 **segment** collision domains。Hub、repeater 係 **Layer 1**，只會令 collision domain 變大；NIC 唔係 device（係 device 嘅一部分）。

---

## Q2. How many collision domains are shown in the diagram?

- **A.** three
- **B.** four
- **C.** five
- **D.** six
- ✅ **E.** **seven**
- **F.** eight

**答案：E**

💡 用教授方法：tick 所有 L2/L3 devices（Router1、Switch1、Switch2、Router2、Bridge1）。逐個 interface 數：① Router1–Switch1 ② Switch1–host ③ Switch1–Hub1（hub 同佢 3 部 host 合共 1 個）④ Router1–Switch2 ⑤ Switch2–Router2 ⑥ Router2–Bridge1 ⑦ Bridge1–右邊 segment → **7**。（Broadcast domains = 3）

---

## Q3. Refer to the exhibit. The physical documentation shows a portion of the internetwork of the ABC Company. Which segments will be free of collisions?

- **A.** segments 1 and 2
- **B.** segments 1, 2, and 3
- **C.** segments 1, 2, 3, 4, and 5
- **D.** segments 2 and 3
- ✅ **E.** **segments 3, 4, and 5**
- **F.** segments 4, and 5

**答案：E**

💡 Segment 1、2 喺 **hub** 嗰邊：hub 係 Layer 1、half duplex，所有 ports 同一個 collision domain → 可能撞。🗣️「見到 hub 就係 bad news」。Segment 3（router–switch）、4、5（switch–PC）都係 **one port, one device + full duplex** → collision-free。

---

## Q4. Refer to the exhibit. How many broadcast domains are shown?

- ✅ **A.** **three**
- **B.** four
- **C.** five
- **D.** six
- **E.** eight
- **F.** ten

**答案：A**

💡 只有 **router** 分隔 broadcast domains（bridge/switch 會 forward broadcast）。Miller 有兩個 interfaces（Bridge 邊、Switch 邊）；Kaiser 有兩個 interfaces（同一部 Switch 邊 —— 同 Miller 共用、右邊 Switch/Hub 邊）→ ① Miller–Bridge 邊 ② Miller–Switch–Kaiser ③ Kaiser–Switch–Hub 邊 = **3**。（Collision domains = 7）

---

## Q5. Refer to the exhibit. A network associate needs to establish an Ethernet connection between Host A and Host B. However, the distance between the two hosts is further than the cabling standards allow. Which two devices that operate at the physical layer of the OSI can be used to allow Host A and Host B to communicate? (Choose two.)

- **A.** switch
- ✅ **B.** **hub**
- **C.** bridge
- **D.** router
- ✅ **E.** **repeater**

**答案：B, E**

💡 🗣️ Underline「**physical layer**」。訊號行遠會 degrade，要 **regenerate**；所有 network devices 都會 regenerate，但只有 **hub 同 repeater** 係 Layer 1（physical layer）。Switch/bridge = L2，router = L3。

---

## Q6. Refer to the exhibit. What is the order of the TCP/IP Protocol Data Units as data is moved as indicated through the OSI model?

- **A.** bits, segments, frames, packets, data
- ✅ **B.** **bits, frames, packets, segments, data**
- **C.** bits, frames, segments, packets, data
- **D.** bits, packets, frames, segments, data

**答案：B**

💡 箭咀由 Physical 向上 = **de-encapsulation**。PDU：Physical = **bits** → Data Link = **frames** → Network = **packets** → Transport = **segments** → 上三層 = **data**。口訣反轉：Dozens of Sausage Pizza Full Belly（D-S-P-F-B）倒轉讀 B-F-P-S-D。

---

## Q7. Which physical network topology is easy to monitor and troubleshoot, easy to add new devices to as the network expands, but subject to complete failure when a central hub or switch ceases to work?

- **A.** bus
- ✅ **B.** **star**
- **C.** ring
- **D.** mesh

**答案：B**

💡 **Star**：most commonly used in Ethernet LAN；有 central connection point（hub/switch/router），易管理、易加機；但 **if the central device fails, the whole network becomes disconnected**。（教授話呢題 out of study guide，但都要識）

---

## Q8. Refer to the exhibit. The hub and the switch are operating using factory default settings. Which hosts will receive the frame if host A transmits a broadcast frame?

- **A.** Only workstation B and the router will receive the data.
- ✅ **B.** **Workstations B, C, D, E, and the router will receive the data.**
- **C.** Only workstations connected to the hub will receive the data.
- **D.** Workstations B, C, D, E, and the router will receive the data and it will be forwarded into the Internet.

**答案：B**

💡 Broadcast（FF-FF-FF-FF-FF-FF）→ switch **flood** 去 B、router 同 hub；hub 再 flood 去 C、D、E。**Router 收到但唔會 forward broadcast 去 Internet**（router filters broadcasts）。所以 B、C、D、E 同 router 收到。

---

## Q9. Why would a company install a switch instead of a hub when building or expanding a corporate network?

- **A.** A switch manages frames faster than a hub does. A switch operates at 100 Mbps.
- **B.** A hub operates at a maximum of 10 Mbps.
- **C.** A switch modifies the Ethernet frame to remove any errors. A hub forwards the frame exactly as it arrived.
- ✅ **D.** **A switch provides more bandwidth by sending frames only out the port to which the destination device is attached. A hub sends the bits out all ports except the source port.**

**答案：D**

💡 🗣️ 教授排除法：A、B 講 **速度（Mbps）—— 堂上冇講過 → 唔會係答案**。C「remove any errors」= **error correction**，但 switch 係 Layer 2，只有 **error detection（FCS）** → 錯。D 正確：table 完整後 switch **forward** 去單一 port，唔 flood，唔浪費其他 ports 嘅 bandwidth。

---

## Q10. An Ethernet host receives a frame, calculates the FCS, and compares the calculated FCS to the FCS received in the frame. The host finds that the two FCS values do not match. What action will be taken by the host?

- ✅ **A.** **The host discards the frame.**
- **B.** The host processes the data frame normally.
- **C.** The host initiates a request for retransmission of the frame.
- **D.** The host sends the frame content to an upper layer protocol for error recovery.

**答案：A**

💡 FCS 唔 match → receiver **simply discard**，乜都唔做（唔會要求重寄）。🗣️ 重寄點發生？Sender 寄出後等 **acknowledgement**；receiver discard 咗就冇 ACK → sender 嘅 timer expires → sender 自己 **retransmit**（Transport layer 嘅 error correction）。

---

## Q11. Based on the graphic above, which of the following occurs as each host system comes on line in the topology?

- **A.** The switch sends its MAC address to each host.
- ✅ **B.** **The switch adds MAC address to the MAC table as each host sends a frame.**
- **C.** Each host exchanges MAC addresses with each other.
- **D.** The switch listens for data traffic to block since the switch lacks an IP address.

**答案：B**

💡 Switch 開始時 table 係空；每當有 host **send a frame**，switch 就睇 **source MAC address** 同入嚟嘅 port，**dynamically** 加入 MAC address table。

---

## Q12. Refer to the exhibit. Identify the devices labeled A, B, C, and D in the network physical documentation.

- **A.** A=bridge, B=switch, C=router, D=hub
- ✅ **B.** **A=bridge, B=hub, C=router, D=switch**
- **C.** A=bridge, B=router, C=hub, D=switch
- **D.** A=hub, B=bridge, C=router, D=switch

**答案：B**

💡 Icon 記法：**彎形 = bridge**（A）；**盒 + 1 箭（有一排 ports）= hub**（B）；**圓形 = router**（C）；**盒 + 4 箭 = switch**（D）；盒冇箭 = repeater。

---

## Q13. Which of the following are layers of the TCP/IP model? (Choose three.)

- ✅ **A.** **Application**
- **B.** Physical
- ✅ **C.** **Internet**
- ✅ **D.** **Network Access**
- **E.** Presentation

**答案：A, C, D**

💡 TCP/IP model 四層：**Application、Transport、Internet、Network Access**。Physical 同 Presentation 係 OSI 嘅 layers（OSI 頭三層合併做 Application；Data Link + Physical 合併做 Network Access）。

---

## Q14. Which of the following are ways that bandwidth is commonly measured? (Choose three.)

- **A.** GHzps
- ✅ **B.** **kbps**
- ✅ **C.** **Mbps**
- **D.** Nbps
- **E.** MHzps
- ✅ **F.** **Gbps**

**答案：B, C, F**

💡 Bandwidth = amount of information that can flow through a network connection in a given period of time → 單位係 **bits per second**：**kbps、Mbps、Gbps**（細 b）。GHzps、MHzps、Nbps 係假單位（Hz 係頻率）。

---

## Q15. Refer to the following list (1 = segments, 2 = bits, 3 = packets, 4 = data, 5 = frames). Choose the correct order of data encapsulation when a device sends information.

- **A.** 1 - 3 - 5 - 4 - 2
- **B.** 2 - 1 - 3 - 5 - 4
- **C.** 2 - 4 - 3 - 5 - 1
- **D.** 4 - 3 - 1 - 2 - 5
- ✅ **E.** **4 - 1 - 3 - 5 - 2**
- **F.** 3 - 5 - 1 - 2 - 4

**答案：E**

💡 Sender encapsulation（由上而下）：**Data（4）→ Segments（1）→ Packets（3）→ Frames（5）→ Bits（2）** = 4-1-3-5-2。口訣：**D**ozens of **S**ausage **P**izza **F**ull **B**elly。

---

## Q16. Refer to the exhibit. The switch and the hub have default configurations, and the switch has built its CAM table. Which of the hosts will receive the data when workstation A sends a unicast packet to workstation C?

- ✅ **A.** **workstation C**
- **B.** workstations B and C
- **C.** workstations B, C, and the E0 interface of the router
- **D.** workstations B, C, D, E, F, and the E0 interface of the router

**答案：A**

💡 🗣️ Underline「**the switch has built its CAM table**」= table 完整。A → C 係 unicast，C 喺 table 而且唔同 port → **forward** 只去 C 嗰個 port。（如果 table 未齊先會 flood）

---

## Q17. Which networking devices use the MAC address to make decisions? (I) NIC (II) bridge (III) hub (IV) switch (V) repeater — Which two options are correct?

- **A.** I and III
- **B.** I and IV
- **C.** II and III
- **D.** III and V
- ✅ **E.** **II and IV**

**答案：E**

💡 用 MAC address 做決定 = **Layer 2 devices：bridge 同 switch**。🗣️「**NIC 唔係 device，係 device 嘅一部分**」，所以唔揀 NIC。Hub、repeater 係 L1，唔睇 address。

---

## Q18. Which devices are primarily used to extend cable segments within a collision domain by regenerating the data signals? (I) switch (II) repeater (III) router (IV) bridge (V) hub — Which two options are correct?

- **A.** I and III
- **B.** II and IV
- ✅ **C.** **II and V**
- **D.** III and V
- **E.** I and IV

**答案：C**

💡 🗣️「所有 network devices 都會 regenerate」，所以要 underline「**within a collision domain**」（唔可以分割 collision domain）同「**primarily**」（主要功能就係 regenerate）→ **repeater 同 hub**（Layer 1）。

---

## Q19. Which devices will create multiple collision domains in an Ethernet network? (I) NIC (II) hub (III) switch (IV) router (V) repeater — Which two options are correct?

- **A.** I and III
- ✅ **B.** **III and IV**
- **C.** II and III
- **D.** III and V
- **E.** I and IV

**答案：B**

💡 同 Q1 一樣，只係用 bubble sheet 格式：**switch（III）同 router（IV）**分割 collision domains。

---

## Q20. A network administrator has a multi-floor LAN to monitor and maintain. Through careful monitoring, the administrator has noticed a large amount of broadcast traffic slowing the network. Which device would you use to best solve this problem?

- **A.** bridge
- **B.** hub
- ✅ **C.** **router**
- **D.** transceiver

**答案：C**

💡 大量 broadcast = broadcast domain 太大。**Router**（Layer 3）唔 forward broadcasts → **break up the broadcast domain**，令每個 broadcast domain 變細。Bridge 會 forward broadcast，冇用。

---

## Q21. What will a bridge do if it receives a frame with a MAC address that is not within the table?

- **A.** discard frame
- **B.** ignore frame
- **C.** send frame to appropriate port
- ✅ **D.** **send frame to all ports except source port**

**答案：D**

💡 Bridge 同 switch 一樣係 Layer 2：destination MAC **唔喺 table → flood** = send out all ports except the incoming (source) port。

---

## Q22. You are a network technician at UST. Your newly appointed trainee wants to segment a network. What devices would you advise him? (Choose all that apply.)

- **A.** Use switch and hub converter.
- **B.** Use media converters.
- ✅ **C.** **Use switches.**
- ✅ **D.** **Use routers.**
- ✅ **E.** **Use bridges.**
- **F.** Use repeaters.

**答案：C, D, E**

💡 🗣️「hub converter、media converter 堂上冇講過 → 直接刪」。**Segment**（分割 collision / broadcast domains）嘅 devices = **switches、routers、bridges**（L2 + L3）。Repeater 係 L1，只會延伸。

---

## Q23. Which of the following is true about the Ethernet FCS field?

- **A.** It is used for error recovery.
- **B.** It is 2 bytes long.
- **C.** It is used for encryption.
- ✅ **D.** **It resides in the Ethernet trailer, not the Ethernet header.**
- **E.** None of the above

**答案：D**

💡 FCS 用嚟 **error detection**，唔係 error recovery / correction；長度堂上冇講（→ 唔揀）；encryption 係 Presentation layer。FCS 位於 **frame trailer**（frame header 放 MAC addresses）。

---

## Q24. What is the bit length and expression form of a MAC address?

- **A.** 24 bits expressed as a decimal number
- **B.** 24 bits expressed as a hexadecimal number
- **C.** 36 bits expressed as a binary number
- **D.** 48 bits expressed as a decimal number
- ✅ **E.** **48 bits expressed as a hexadecimal number**

**答案：E**

💡 MAC address = **48-bit binary value expressed as 12 hexadecimal digits**（first 24 bits = OUI，last 24 bits = vendor assigned）。IPv4 先係 32 bits dotted decimal。

---

## Q25. At Layer 2 of the OSI model, which component connects a host to the network media?

- **A.** Hub
- **B.** Switch
- **C.** Bridge
- ✅ **D.** **NIC**
- **E.** Transceiver

**答案：D**

💡 **NIC（Network Interface Card）**connect device to the media；NIC 有 MAC address，considered Layer 2（亦 operate at Layer 1 send/receive signals）。

---

## Q26. With which OSI layer is the term frame associated?

- **A.** Physical
- **B.** Network
- **C.** Session
- ✅ **D.** **Data Link**

**答案：D**

💡 PDU：bits = Physical；**frames = Data Link**；packets = Network；segments = Transport。

---

## Q27. Which OSI layer is responsible for logical addressing?

- **A.** Data Link
- **B.** Physical
- **C.** Transport
- ✅ **D.** **Network**

**答案：D**

💡 **Network layer**：address（logical address = IP）+ best path（path determination）。Data Link 係 physical address（MAC）。

---

## Q28. What portion of a MAC address is used as a vendor code?

- ✅ **A.** **First 6 hexadecimal digits**
- **B.** Last 6 hexadecimal digits
- **C.** First 2 hexadecimal digits
- **D.** None

**答案：A**

💡 **OUI（Organizationally Unique Identifier）= first 3 bytes = first 24 bits = first 6 hex digits**，由 **IEEE** 分配俾 vendor（例如 Cisco 00-60-2F）；last 6 hex digits 由 vendor 分配俾每張 NIC。

---

