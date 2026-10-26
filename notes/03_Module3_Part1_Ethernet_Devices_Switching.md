# Module 3（Part I）：Ethernet —— Networking Devices & Switching

> **Midterm Study Guide 列明 Module 3 考：**
> **Networking Devices**（Repeaters、Hubs、Switches、Routers）、**Communication Between Devices in a LAN Network**、**Switching Frames**、**Collision Domains and Full Duplex**、**Collision Domain and Broadcast Domain**、**Layer 2 Broadcasts**
>
> 🎯 Review Questions 28 題入面大約 **20 題係 Module 3** —— 呢章係 **midterm 最大分數來源**！

---

## 0. 教授特別提醒 🗣️

- 🗣️ 「我嘅考試唔考 memorization，考 **understanding**；會有**好多 diagrams（scenario-based）**。」
- 🗣️ 「考試入面 diagram **只會畫 icon，唔會寫名**！你要一見 icon 就知係咩 device。」（所以下面 icon 一定要記熟）
- 🗣️ 「理解 switch 極之重要（extremely important）。」

---

## 1. Ethernet 簡介

- LAN 技術歷史上有 **Ethernet、Token Ring、FDDI** 三種；而家 **99% 嘅 LAN 都係 Ethernet**（其餘兩種已經淘汰）。
- **The success of Ethernet is due to its simplicity and ease of maintenance, as well as its ability to incorporate new technologies, reliability, and low cost of installation and upgrade.**
  - 🗣️ 記：**low cost、easy to install、easy to upgrade、reliable**。
- 🗣️ 交換器 port 叫 **E0、E1、E2…**（**E = Ethernet**，由 0 開始數）。

---

## 2. Physical Topology（實體拓撲）

**Physical topology is the actual layout of the wire or media.**

| Topology | 特點 |
|---|---|
| **Bus** | **Connects all the devices using a single cable**；**main cable segment must end with a terminator that absorbs the signal when it reaches the end**（否則 data 會反彈 bounce back） |
| **Star** ⭐ | **Most commonly used in Ethernet LAN**；**central connection point can be a hub, switch or router**，可用於 **security or restricted access**；⚠️ **If the central device fails, the whole network becomes disconnected** |
| **Ring** | **Frame travels around the ring, stopped at each node**；node 想傳 data 時可以加入 data 同 destination address（🗣️ 用 **token**） |
| **Full-mesh** | **Connect all devices to each other for redundancy and fault tolerance**（🗣️ 最 reliable：部分連線斷咗都仲可以通訊，例如 NASA、核電廠） |
| **Partial-mesh** | **At least one device maintains multiple connections to others** |

> 🎯 **Review Q7**："Easy to monitor and troubleshoot, easy to add new devices, but subject to complete failure when a central hub or switch ceases to work" → **Star**

- 🗣️ Star + restricted access 例子（M3 Supplementary）：Percy (PC1)、Students (PC2)、Exam server、Email server 全部經中間 router —— 可以喺 router 設 **ACL (Access Control List)**，令學生 **midterm 前唔可以入 exam server**，但可以入 email server（ACL 細節喺 ISOM 3380 教）。



---

## 3. ⭐⭐ Networking Device Icons（必背！考試冇名）

| Icon 形狀 | Device | 教授記法 |
|---|---|---|
| **圓形（cylinder）+ 四個箭咀向內外交叉** | **Router** | 「見到**圓**嘅就係 router」 |
| **方盒 + 4 個箭咀**（兩對相反方向） | **Switch**（Workgroup Switch） | 「**4 arrows = switch**」 |
| **方盒 + 1 個箭咀**（雙頭箭 / 單箭，盒邊有一排 ports） | **Hub**（10BASE-T / 100BASE-T Hub） | 「**1 arrow = hub**」 |
| **方盒，冇箭咀**（正面有方格 / 橫線） | **Repeater** | 「**No arrow = repeater**」 |
| **彎曲 / 凹形（好似 U 形 / 滑板）** | **Bridge** | 「呢個 funny device 係 bridge」 |
| **雲** | **Network Cloud** | 「雲入面可以係**任何嘢**：PC、server、router、repeater……」 |



> 🎯 **Review Q12**：A = 彎形 → **bridge**；B = 盒 + 1 箭 + ports → **hub**；C = 圓形 → **router**；D = 盒 + 4 箭 → **switch**。

- 媒介 icon（Module 1）：**Wireless media = 波浪線**；**LAN media = 直線**；**WAN media = 紅色閃電 Z 線**（serial link）。

---

## 4. Repeater（中繼器）—— Layer 1

**Repeated Ethernet Signal（slide 5–6）：**
- **Betty sends a clean signal.**
- **The signal degrades by the time it reaches the repeater.**
- **The repeater regenerates a new, clean signal and sends it out its other port.**

**Repeaters（slide 7）：**
- **When a signal is sent over a wire, it degrades.**（🗣️ 好似銅線有 resistance，電流越行越弱；聲音傳遠會弱）
- **To extend the distance of LANs, repeaters were developed.**
- **Typically had two ports connecting two different Ethernet segments.**
- **Interpreted the incoming signal on one port as 1's and 0's.**
- **Sent a regenerated clean signal out the other port.**
- **Repeaters: Layer 1**（只處理 1s and 0s）



> 🗣️ **Repeater 只做一件事：regenerate signals。No decision making（唔做任何決定）。**
> 🗣️ 好似咪高峰 amplify 聲音，但 data 唔叫 amplify，叫 **regenerate**。

---

## 5. Hub（集線器）—— Layer 1

- **Regenerate signals**
- **Used as network concentration points**
- **Multiport repeater**（🗣️ 同 repeater 一樣，分別只係 **port 數目多啲**）
- **Layer 1 device**

**Hub Operation（slide 10）：** Fred 由 **port 0** 送訊號入 hub → hub："**I'm receiving a signal on port 0 – send it out the other ports!**" → 複製去 port 1、2、3（**唔會送返 port 0**）。



> 🗣️ **Flooding** = **send out every port except the incoming port**（送去所有 port，除咗入嚟嗰個）。Hub 永遠 flood，**冇 table、冇 decision**。
> ⚠️ Hub **唔睇 MAC address**、**唔睇 FCS**、**唔支援 full duplex**（hub port 只可以 half duplex）。

---

## 6. NIC（Network Interface Card）—— Layer 2（亦做 Layer 1）

- **Carries a unique code called a Media Access Control (MAC) address.**
- **MAC address controls data communication for the host on the network.**
- **NICs are considered layer 2 and operate at both layer 1 and 2**（**Layer 1：send and receive signals over an attached cable**）。
- 🗣️ NIC = **connect device to the media**；**MAC address 喺 NIC 入面**；想換 MAC 就要換 NIC。

> 🎯 **Review Q25**："At Layer 2 of the OSI model, which component **connects a host to the network media**?" → **NIC**
> ⚠️ **Review Q17**：「邊啲 networking **devices** 用 MAC address 做決定？」→ **Bridge 同 Switch**。🗣️「**NIC 唔係 device，係 device 嘅一部分**」，所以唔揀 NIC！

---

## 7. ⭐⭐⭐ Switch（交換器）—— Layer 2（最重要！）

### 7.1 基本概念
- **Layer 2 device designed to create two or more LAN segments, each of which is a separate collision domain.**
- **Switches filter traffic by looking at MAC addresses.**
- **Filter traffic on a LAN to keep local traffic local yet allow connectivity to other parts.**
- **Keep track of which MAC addresses are on each side of the switch and makes forwarding decisions based on MAC address table.**
- **When a switch receives a frame, the destination MAC address is looked up in the switching table to determine whether to filter, flood or forward the frame onto another segment.**
- 🗣️ **Switch 係第一個「會做決定」嘅 device**（repeater/hub 唔做決定）。

### 7.2 MAC Address Table（又叫 **Switching table / CAM table**）
- Cisco 叫 **CAM (Content Addressable Memory) table**。
- 🗣️ 三個 columns：**MAC address | Port | Timestamp**

| MAC address | Port | Timestamp |
|---|---|---|
| MAC-F | E0 | 10:57 → 11:09（更新） |
| MAC-Q | E1 | 11:00 |
| MAC-L | E0 | 11:01 |
| MAC-V | E1 | 11:02 |

### 7.3 ⭐ 兩條黃金規則（教授重複講好多次）

> **規則 1：Table 用 SOURCE MAC address 建立（learning）**
> - **Examine the source MAC address of the frame and the interface on which it was received.**
> - **Add that source MAC address and corresponding interface to the table.**
> - 自動進行 → **dynamically**（冇人幫手，switch 自己做）。
> - 如果 source MAC 已經喺 table → **update timestamp**。
> - 🗣️「Table、port、timestamp —— **全部只同 source 有關**。」
>
> **規則 2：Decision 用 DESTINATION MAC address 決定**
> - 🗣️「**Destination 只用嚟做 decision**。」

### 7.4 ⭐ 三種決定：Flood / Forward / Filter

| Decision | 幾時 | 做乜 |
|---|---|---|
| **Flood（泛洪）** | **Destination MAC 唔喺 table**（unknown unicast）**或者係 broadcast** | **Send out all ports except the incoming port** |
| **Forward（轉發）** | Destination MAC 喺 table，而且**同入嚟嘅 port 唔同** | **只送去嗰一個正確 port** |
| **Filter（過濾 / 唔理）** | Destination MAC 喺 table，而且**同入嚟嘅 port 一樣**（source 同 destination 喺同一 port） | **Do nothing**（唔轉發；目的地已經收到咗） |

**Switching Frames（slide 33，原文要識）：**
1. **A frame is received.**
2. **If the destination is a broadcast, forward on all ports except the port in which the frame was received.**
3. **If the destination is a Unicast and the address is not in the address table, forward on all ports except the port in which the frame was received.**
4. **If the destination is a Unicast and the address is in the address table, and if the associated interface is not the interface in which the frame arrived, forward the frame out the one correct port.**
5. **Otherwise, filter (do not forward) the frame.**

```
收到 frame
  ├─ 1) 用 SOURCE MAC 更新 table（新加入 / 更新 timestamp）
  └─ 2) 睇 DESTINATION MAC：
        ├─ Broadcast (FF-FF-FF-FF-FF-FF)？ → FLOOD
        ├─ 唔喺 table？ → FLOOD（unknown unicast）
        └─ 喺 table：
             ├─ 同 incoming port 一樣？ → FILTER
             └─ 唔同 port？ → FORWARD（只送嗰個 port）
```

### 7.5 ⭐ 教授課堂例子（M3 Supplementary p.3）
Switch：E0 接 F 同 L（同一條 shared segment），E1 接 Q 同 V。開始時 table 係空。

| # | Communication | MAC (S, D) | Table 學到 | Decision |
|---|---|---|---|---|
| 1 | **F → Q** | (MAC-F, MAC-Q) | **MAC-F @ E0**（10:57） | Q 唔喺 table → **Flood** |
| 2 | **Q → F** | (MAC-Q, MAC-F) | **MAC-Q @ E1** | F 喺 E0（≠ E1）→ **Forward to E0** |
| 3 | **L → V** | (MAC-L, MAC-V) | **MAC-L @ E0** | V 唔喺 table → **Flood** |
| 4 | **V → L** | (MAC-V, MAC-L) | **MAC-V @ E1** | L 喺 E0 → **Forward to E0** |
| 5 | **F → L** | (MAC-F, MAC-L) | F 已存在 → **update timestamp** | L 喺 E0 = incoming E0 → **Filter** |

- ⚠️ 如果 table 係**空**，F → L（同一 port）：switch 學到 F@E0，但 L 唔喺 table → **仍然 flood**（雖然 L 已經收到）。🗣️「Destination 唔喺 table，switch 就**盲目 flood**。」



### 7.6 Timestamp 有咩用？（Aging）
- 每次某 device 送 frame，switch 就 **update 佢嘅 timestamp**。
- 如果某 entry 嘅 timestamp **好耐冇更新**（例如部機熄咗 / 移走咗）→ switch **自動刪除 (remove) 該 entry**（dynamic removal）。（板書例子：**5 min**）
- 🗣️ Table 嘅**建立同刪除都係 dynamic**。

### 7.7 Slide 例子（Fred / Barney / Wilma / Betty）
- **Flooding Unknown Unicasts（slide 15）**：CAM 開始 **Empty** → Fred (0200.1111.1111) 送 frame 俾 Barney (0200.2222.2222)，由 port 1 入 → switch："**Source MAC is 0200.1111.1111 – it came in port 1 – add it to switching table!**" → CAM After：0200.1111.1111 → port 1；Barney 唔喺 table → **flood**。


- **Two Switches（slide 17）**：之前 Wilma (3333) 已經講過嘢，所以 SW1 CAM 有 3333@port 4、SW2 有 3333@port 1。Fred (1111) → Wilma：SW1 學 **1111@port 1**、forward 去 port 4；SW2 學 **1111@port 3**、forward 去 port 1 → Wilma。
  - 🗣️ **教授 IQ 題**：點樣嘅通訊令 SW1 有 3333@4、SW2 有 3333@1？→ **Sender 一定係 3333**（table 只記 source）；receiver 可以係 **1111 或 2222**，甚至係 **4444**（table 空時 SW2 唔識 4444 → flood 埋去 SW1，所以 SW1 都學到 3333）。


- **Filter Decision（slide 18）**：Fred → Barney（兩部都喺左邊 hub）。Hub "regenerate and repeat!" → Barney 收到 "process it!"；switch：「**0200.2222.2222 is reachable via port 0. The frame came in port 0. Filter!!**」


- **Forwarding Decision（slide 19）**：Fred → Wilma。Switch：「**0200.3333.3333 is reachable via port 1. The frame came in port 0. Forward!!**」→ 右邊 hub regenerate → Wilma "is me! Process the frame!"；Betty "sent to someone else – ignore it!"；Barney 亦 ignore。



> 🎯 **Review Q11**：Host 開機上線時？→ **"The switch adds MAC address to the MAC table as each host sends a frame."**（switch **唔會**主動送自己 MAC；hosts 唔會互相交換 MAC）
> 🎯 **Review Q16**：「switch has **built its CAM table**」→ table 完整 → A → C unicast **只 forward 去 C** → 只有 **workstation C** 收到。🗣️ 要 underline「built its CAM table」！
> 🎯 **Review Q21**：Bridge 收到 destination MAC **唔喺 table** → **send frame to all ports except source port**（flood）。

### 7.8 LAN Switches 小結（slide 20）
- **Layer 2 device.**
- **Use a table of MAC addresses (switching table) to determine the segment on which a frame needs to be transmitted.**
- **Cisco switching table sometimes referred to as Content Addressable Memory (CAM).**
- **Give each host the medium's full bandwidth (microsegmentation).**
- **Improve network performance: speed and bandwidth.**

> 🎯 **Review Q9**：點解用 switch 唔用 hub？→ **"A switch provides more bandwidth by sending frames only out the port to which the destination device is attached. A hub sends the bits out all ports except the source port."**
> 🗣️ 排除法：A/B 講 speed（100 Mbps / 10 Mbps）—— **堂上冇講過 → 唔會係答案**；C「switch modifies the frame to **remove any errors**」= **error correction** → ❌（Layer 2 只有 error detection）。

---

## 8. ⭐ Microsegmentation：Switch 點樣做到 Collision-Free

**Shared segment（before）：All traffic visible on network segment** vs **LAN switch（after）：Multiple traffic paths within switch → Dedicated paths between sender and receiver hosts.**



🗣️ **Switch 三大技術（必背）：**

| 技術 | 防止邊種 collision | 教授比喻 |
|---|---|---|
| **① Dedicated path** | **Switch 內部（inside the switch）**嘅 collision —— 任何 ports 之間都可以有專用路徑（PC1→PC2 同 PC2→PC1 都係唔同 path） | |
| **② Full duplex** | **Port 上「同時 send 同 receive」**嘅 collision（例：**PC1→PC3 同 PC3→PC1 同時**） | 單線雙向會撞車 → 改成**兩條行車線**（cable 入面有唔同 pairs：一啲 send、一啲 receive） |
| **③ Memory buffer (buffering)** | **多過一份 data 同時要由同一 port 出去**（例：**PC1→PC3 同 PC2→PC3 同時**） | 兩條線併做一條 → 用**交通燈**：一個 green 其他 red；其他 frames 喺 **switch memory 排隊** |

**Preventing Collisions with Switch Buffering（slide 23）：**
- **Switches prevent collisions by buffering frames.**
- **If several PCs send frames to the same address at the same time, the switch holds the frames in memory - a process called buffering.**
- **The switch then forwards the frames one at a time.**
- 🗣️ Slide 22 例子：Wilma、Barney、Betty 同時送俾 Fred → 一次只放一個出 port，其他喺 **frame buffers** 等。輪流方式：**round robin**；亦可以設定俾 **time-sensitive data（audio/video streaming）priority**（QoS）。



- 🗣️ **Table 空（要 flood）都唔會 collision**：因為每個 port 都有 memory buffer，一次只放一份出去。
- 🗣️ **Microsegmentation 條件**：**one port, one end device**，或者 **one port 接另一部 switch / router**。如果 switch port 接 **hub** → 嗰個 hub 範圍就有 collision（**hub 係 culprit**）。
- **Full duplex cannot be used if a hub is plugged into the port.**（呢點喺 Part II）



---

## 9. ⭐ Router（路由器）—— Layer 3

- **Layer 3 device.**
- **Use logical address (network layer address).**（= IP address）
- **Can connect different layer 2 technologies.**
- **Examine incoming packet (layer 3 data), choose the best path, and switch them to the proper outgoing port.**
- 🗣️ **Router 係最重要嘅 network device**（冇 router 就冇 Internet）。

🗣️ **Router 細節：**
- Router 嘅 port 叫 **interface**（switch 叫 port）。
- Interface 名：**E0/E1 = Ethernet**（接 switch / PC）；**F = FastEthernet**；**S0/S1 = Serial**（**router 同 router 之間嘅連線 = serial connection**）。
- Router 維持 **routing table**（主要內容：**IP address（network address）+ interface**）。
- ⚠️ **Router 只做兩種決定：Forward 同 Filter —— Router 唔會 Flood！**
  - 所以 routing table 唔齊就**無法通訊** → 要用 **routing protocols** 幫 router **盡快建立 routing table**（例：**RIP、IGRP/EIGRP、OSPF**；細網用 RIP，大網用 OSPF/EIGRP）。
  - 🗣️ 相鄰 routers 好似「師奶 gossip」：互相交換自己 routing table 嘅資訊，一個傳一個。


- **Router 唔 forward broadcast**（filter broadcasts）→ **router 分隔 broadcast domains**（Part II）。

> 🎯 **Review Q20**：多層 LAN 好多 **broadcast traffic** 令網絡慢 → 用 **router**（break 大 broadcast domain）。

---

## 10. ⭐ MAC Address：Ethernet Identity

- **Layer 2 Ethernet MAC address is a 48-bit binary value expressed as 12 hexadecimal digits.**
- **IEEE (Institute of Electrical and Electronics Engineers)** 要求 vendor：
  - **Must use that vendor's assigned OUI as the first 3 bytes.**
  - **All MAC addresses with the same OUI must be assigned a unique value in the last 3 bytes.**

| 部分 | Bits | Hex digits | 例子 | 意思 |
|---|---|---|---|---|
| **OUI (Organizationally Unique Identifier)** | **24 bits（first 3 bytes）** | **6 hex digits** | **00-60-2F** | **Vendor code**（例：Cisco） |
| **Vendor Assigned (NIC, Interfaces)** | **24 bits（last 3 bytes）** | **6 hex digits** | **3A-07-BC** | **Particular device**（每張 NIC 唔同） |



- **寫法（三種都係同一個 MAC）**：**00-05-9A-3C-78-00**、**00:05:9A:3C:78:00**、**0005.9A3C.7800**（Cisco 格式）。
- 🗣️ IEEE 亦負責定 **network standards**（例如 Wi-Fi router 背面嘅 **802.11**）。
- 🗣️ MAC address 全球 **unique**；IP 位置變會變，MAC 唔變。

> 🎯 **Review Q24**：MAC address 嘅 bit length 同表示方法？→ **48 bits expressed as a hexadecimal number**
> 🎯 **Review Q28**：MAC address 邊部分係 **vendor code**？→ **First 6 hexadecimal digits**（OUI）

### 10.1 Frame Processing（slide 27）
- **MAC addresses assigned to workstations, servers, printers, switches, and routers.**
- **When a device is forwarding a message to an Ethernet network, it attaches header information to the packet, contains the source and destination MAC address.**
- **Each NIC views information to see if the destination MAC address in the frame matches the device's physical MAC address stored in RAM.**
- **No match, the device discards the frame.**
- **Matches the destination MAC of the frame, the NIC passes the frame up the OSI layers, where the de-encapsulation process takes place.**

---

## 11. ⭐ Communication Between Devices in a LAN Network

| 類型 | 定義 | 🗣️ 教授例子 |
|---|---|---|
| **Unicast** | **A frame is sent from one host addressed to a specific destination. One sender and one receiver.** **Unicast transmission is still the predominant form of transmission on LANs and within the Internet.** | 一對一 |
| **Broadcast** | **A frame is sent from one address to all other devices. One sender, but the information is sent to all connected receivers by using a universal broadcast address.** | 一個人 send 俾全班 |
| **Multicast** | **The destination address is a specific group of devices, or clients.** | 只 send 俾班上**男仔**、只俾 **IS 主修**、只俾 **year 2** |

### 11.1 Broadcast Address（點樣「造」出嚟）
- **IPv4 broadcast address**：**32 bits 全部變 1** → 每個 octet 11111111 = 255 → **255.255.255.255**
  - （Slide 例子用 subnet broadcast **192.168.1.255**，即同一網絡內所有 hosts）
- **Broadcast MAC address**：**48 bits 全部變 1** → 每 4 個 1 = F → **12 個 F：FF-FF-FF-FF-FF-FF**
- 🗣️ 唔會逐個加 IP-2 + IP-3 + IP-4 + IP-5（如果有 100 部機咪要加 100 個 address？）→ 用一個特別嘅 broadcast address 就得。

Slide 30 例子：Source host IP **192.168.1.5**、MAC **00-07-E9-63-CE-53** → Dest MAC **FF-FF-FF-FF-FF-FF**、Dest IP **192.168.1.255**（IP packet 包喺 Ethernet frame 入面）。



### 11.2 Multicast Address
- **Multicast MAC address is a special value that begins with 01-00-5E in hexadecimal.**（例：01-00-5E-00-00-C8）
- **Range of IPv4 multicast addresses is 224.0.0.0 to 239.255.255.255.**（例：224.0.0.200）



### 11.3 Switch 處理 Broadcast ⭐
- Destination = **FF-FF-FF-FF-FF-FF** → **永遠 flood**（無論第幾次）。
- 🗣️ 點解第二、三次都仲係 flood？因為 switch **只學 source MAC**；**FF-FF-FF-FF-FF-FF 永遠只會係 destination，永遠唔會係 source** → 永遠唔會入 table → **永遠 flood**。
- 🗣️ **True or False 陷阱**：「Destination 係 unicast 就唔會 flood」→ **False**！Unicast 但 destination **唔喺 table**（unknown unicast）都會 flood。

> 🎯 **Review Q8**：Host A 經 switch 送 **broadcast frame**（switch 同 hub 都係 factory default）→ switch flood 去 B 同 router，亦去 hub；hub 再 flood 去 C、D、E；**router 唔會將 broadcast 傳出 Internet** → 答案：**Workstations B, C, D, E, and the router will receive the data.**

---

## 12. Device 屬於邊一層？（🗣️ 教授總結）

| Device | Layer | 原因（睇咩做決定） |
|---|---|---|
| **Media（cables）** | **Layer 1** | 1s and 0s |
| **Repeater** | **Layer 1** | 只處理 1s and 0s，冇決定 |
| **Hub** | **Layer 1** | 只處理 1s and 0s，冇決定 |
| **NIC** | **Layer 2**（亦 operate at L1） | MAC address |
| **Bridge** | **Layer 2** | **MAC address** |
| **Switch** | **Layer 2** | **MAC address** |
| **Router** | **Layer 3** | **IP address（logical address）** |
| **PC / Host** | **Layer 1–7** | 可以做**全套 encapsulation** |
| **Cloud** | **任何（1–7）** | 雲入面可以係任何嘢 |

### 12.1 FCS 邊個睇到？（🗣️ 9/24 講）
- Receiver de-encapsulate 到 Data Link 就見到 **frame trailer = FCS** → FCS 唔 match → **discard**。
- **中間嘅 switch（L2）同 router（L3）都 de-encapsulate 到 Data Link 或以上 → 都見到 FCS → 都可以 detect errors 並 discard**（冇必要送去目的地）。
- **Hub / repeater（L1）睇唔到 FCS**。

---

## 13. Bridge（網橋）—— Layer 2（slides 冇詳細講，但 Review Q 有考）

- Icon：**彎曲 / 凹形**。
- **Layer 2**：同 switch 一樣用 **MAC address table** 做 **flood / forward / filter**。
- 通常 port 數少（例如 2 個），將 LAN 分成兩個 segments → **segment collision domain**（每個 interface 一個 collision domain）。
- ⚠️ **Bridge 會 forward broadcasts**（同 switch 一樣）→ **唔會**分隔 broadcast domain（**"Broadcasts in a Bridged Environment"：A broadcast is also forwarded across all bridges… This eliminates the benefits of having a bridged network.**）

> 🎯 **Review Q21**：Bridge 收到 MAC 唔喺 table 嘅 frame → **send frame to all ports except source port**。
> 🎯 **Review Q22**：想 **segment a network** → **switches、routers、bridges**（hub/switch converter、media converter 堂上冇講 → 排除；repeaters 唔 segment）。

---

## ✅ Module 3 Part I 快速自測

1. 盒 + 4 箭？→ **Switch**；盒 + 1 箭？→ **Hub**；冇箭？→ **Repeater**；圓形？→ **Router**；彎形？→ **Bridge**
2. Switch 用咩 address 建 table？→ **Source MAC**；用咩做 decision？→ **Destination MAC**
3. 幾時 flood？→ **Destination 唔喺 table 或者係 broadcast**
4. 幾時 filter？→ **Destination 喺 table 而且同 incoming port 一樣**
5. Router 會唔會 flood？→ **唔會**（只 forward / filter）
6. Switch 三大 collision-free 技術？→ **Dedicated path、Full duplex、Memory buffer**
7. MAC address 幾多 bits / hex digits？→ **48 bits / 12 hex digits**；OUI = **first 24 bits / first 6 hex digits**
8. Broadcast MAC？→ **FF-FF-FF-FF-FF-FF**；IPv4 broadcast？→ **255.255.255.255**
9. Multicast MAC 開頭？→ **01-00-5E**；IPv4 multicast range？→ **224.0.0.0 – 239.255.255.255**
10. Star topology 最大缺點？→ **Central device fails → whole network disconnected**
