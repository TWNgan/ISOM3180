# 🎯 ISOM3180 Midterm 考試攻略（最短時間攞最高分）

## 1. 考試資料（教授 20 Oct revision 講）

| 項目 | 內容 |
|---|---|
| **日期時間** | **27 Oct（星期二）10:30 sharp**（上堂時間；**提早 10 分鐘到**） |
| **地點** | **Room 2303 及 2405**（教授會 email 通知你去邊間） |
| **時間長度** | 約 **1 小時 10 分鐘** |
| **形式** | **100% MC questions（bubble sheet）**；closed book；**scenario-based、好多 diagrams** |
| **比重** | Course outline：**Mid-term 20%**（Quiz 22%、Final 28%、3 個 Lab assignments 各 10%） |
| **範圍** | **Module 1、Module 2、Module 3 Part I & Part II**（Intro 唔考；Module 4 之後係 final） |
| **要帶** | **UST ID card**、**最少 2 支鉛筆 + 2 個擦膠**、筆 |
| **規矩** | 手機、smart watch、smart glasses、耳機全部放袋，袋放課室前面；考試前先去廁所 |

> 🗣️ 「多選題喺 bubble sheet 都係**只填一個圈**」—— 例如 "Choose two" 會變成 "Which two options are correct? (I and IV / II and III …)"，只揀一個組合。

---

## 2. Midterm Study Guide（官方考核範圍）

| Module | 考核概念 |
|---|---|
| **Module 1** | **Components of a network**、**Common types of networks**、**Reliable networks** |
| **Module 2** | **OSI Model：Function of each layer**、**Encapsulation and De-Encapsulation** |
| **Module 3** | **Networking Devices**（Repeaters、Hubs、Switches、Routers）、**Communication between devices in a LAN**、**Switching frames**、**Collision domains and full duplex**、**Collision domain and broadcast domain**、**Layer 2 broadcasts** |

🗣️ 教授 revision 額外提：**IPv4 基本（32 bits、4 octets、dotted decimal、每個 octet 0–255）雖然冇寫喺 guide 都要識。**

---

## 3. ⭐ 教授親口講嘅答題技巧（超重要）

1. 🗣️ **「我嘅考試，如果我堂上冇講過嘅嘢，就唔可能係正確答案。唔好揀你唔識嘅選項，揀我堂上講過嘅。」**
   - 例：Q9 嘅 "switch operates at 100 Mbps / hub at 10 Mbps" —— 速度堂上冇講 → 即刻刪走。
   - 例：Q22 嘅 "switch and hub converter"、"media converters" —— 冇講過 → 刪走。
   - 例：Q23 "FCS is 2 bytes long" —— 冇講過 → 刪走。
2. 🗣️ **Underline 題目關鍵字！**
   - "**physical layer**"（Q5）→ 只揀 Layer 1 devices
   - "**switch has built its CAM table**"（Q16）→ table 完整 → forward，唔會 flood
   - "**within a collision domain**"、"**primarily**"（Q18）→ 唔分割 collision domain 嘅 Layer 1 devices
   - "**devices**"（Q17）→ **NIC 唔係 device**（係 device 嘅一部分）
   - "**Choose two / three**"
3. 🗣️ 考 **understanding 唔考 memorization**；但 **OSI 七層次序、PDU 次序、device icons** 一定要記。
4. **Diagram 只有 icon、冇名** → 一定要識認：**圓形 = Router；盒 4 箭 = Switch；盒 1 箭 = Hub；盒冇箭 = Repeater；彎形 = Bridge；雲 = 任何嘢**。
5. 🗣️ **數字轉換（binary/hex）唔會考**；教授亦話 **information security 唔會考你 understanding**（Module 1 security 只需基本認識）。
6. 🗣️ Review Q7（topology）同 Q13（TCP/IP model）教授話 "**not part of our study guide**"，但都係基本知識，識咗佢更穩陣。

---

## 4. ⏱️ 時間有限？按呢個優先次序溫（按出題機率排）

| 優先 | 內容 | 預計時間 |
|---|---|---|
| ⭐⭐⭐ 1 | **數 collision domains / broadcast domains**（教授系統化方法 + 練習） | 30 min |
| ⭐⭐⭐ 2 | **Switch 運作：source 學 table、destination 做 decision；flood / forward / filter；broadcast 永遠 flood** | 25 min |
| ⭐⭐⭐ 3 | **Device 對照表**（Layer、collision/broadcast domain、icon、regenerate、MAC/IP） | 15 min |
| ⭐⭐⭐ 4 | **官方 28 題 Review Questions**（真係會有類似題） | 30 min |
| ⭐⭐ 5 | **OSI 七層功能 + PDU + encapsulation/de-encapsulation + TCP vs UDP + ACK vs FCS** | 25 min |
| ⭐⭐ 6 | **MAC address（48 bits、12 hex、OUI first 6 hex）、broadcast/multicast address** | 10 min |
| ⭐⭐ 7 | **Switch 三大技術（dedicated path、full duplex、memory buffer）+ L1/L2/L3 對 collision 嘅影響** | 15 min |
| ⭐ 8 | **Module 1：components、network types（LAN/WAN/MAN/SAN/WLAN、intranet/extranet）、reliable networks（FT/Scalability/QoS/Security）、bandwidth 單位** | 25 min |

---

## 5. 🔥 最常考嘅 20 個「秒殺」事實

1. **Collision domains** 由 **Switch、Bridge、Router**（L2 + L3）分隔；**broadcast domains** 只由 **Router**（L3）分隔。
2. **Hub / Repeater = Layer 1**：regenerate signals、冇決定、**increase** collision possibility & size、**decrease** number。
3. **Switch / Bridge = Layer 2（MAC）**；**Router = Layer 3（IP / logical address）**。
4. Switch **learn 用 source MAC**、**decide 用 destination MAC**。
5. Destination **唔喺 table / broadcast → flood**；喺 table 且唔同 port → **forward**；同 port → **filter**。
6. **Router 唔 flood**（只 forward / filter）、**唔 forward broadcasts**。
7. Broadcast MAC = **FF-FF-FF-FF-FF-FF**（48 個 1）；IPv4 broadcast = **255.255.255.255**；Multicast MAC 開頭 **01-00-5E**。
8. MAC = **48 bits、12 hex digits**；**OUI（vendor code）= first 24 bits = first 6 hex digits**。
9. OSI（1→7）：**Physical、Data Link、Network、Transport、Session、Presentation、Application**（Please Do Not Throw Sausage Pizza Away）。
10. PDU：**Data → Segment（L4）→ Packet（L3）→ Frame（L2）→ Bits（L1）**。
11. **Network header = source/dest IP**；**Frame header = source/dest MAC**；**Frame trailer = FCS**。
12. **FCS 唔 match → discard frame**（receiver 唔會要求重寄）。
13. **Error correction（retransmission）只喺 Transport layer**；Data Link 只有 **error detection（FCS）**。
14. **TCP reliable（ACK + retransmission）**；**UDP unreliable、快，用於 streaming**。
15. **Logical addressing / path determination = Network layer**；**Frame = Data Link layer**。
16. **NIC** 連接 host 去 network media（L2）；但 **NIC 唔算 "device"**。
17. Switch collision-free：**dedicated path、full duplex、memory buffer** → **microsegmentation**。
18. **Full duplex**：同時 send & receive、**唔使 CSMA/CD**、**接 hub 就用唔到**。
19. **Star topology**：最常用；central device 壞咗成個網斷。
20. **Bandwidth 單位：kbps、Mbps、Gbps**（bits per second；細 b）。

---

## 6. 考試當日 Checklist ✅
- [ ] UST ID card
- [ ] 2 支 2B 鉛筆 + 2 個擦膠 + 筆
- [ ] 10:20 前到 Room 2303 / 2405（睇 email）
- [ ] 手機 / smart watch 關機放袋
- [ ] 考前睇一次本網站嘅 **⚡ Cheat Sheet** 同 **Device 對照表**
