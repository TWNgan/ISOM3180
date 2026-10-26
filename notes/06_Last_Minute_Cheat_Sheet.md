# ⚡ 考前 15 分鐘 Cheat Sheet

## 🧱 Device 總表（最重要！）

| Icon | Device | Layer | 睇咩 | 決定 | 分 Collision Domain？ | 分 Broadcast Domain？ |
|---|---|---|---|---|---|---|
| 盒冇箭 | **Repeater** | 1 | 1s & 0s | 冇（regenerate） | ❌ No | ❌ No |
| 盒 1 箭 | **Hub** | 1 | 1s & 0s | 冇（regenerate + flood） | ❌ No | ❌ No |
| 彎形 | **Bridge** | 2 | **MAC** | flood / forward / filter | ✅ Yes | ❌ No |
| 盒 4 箭 | **Switch** | 2 | **MAC** | flood / forward / filter | ✅ Yes | ❌ No |
| 圓形 | **Router** | 3 | **IP** | **forward / filter（唔 flood）** | ✅ Yes | ✅ **Yes（唯一）** |
| — | NIC | 2（亦做 L1） | MAC | — | 唔係 device | — |
| — | PC | 1–7 | 全部 | — | — | — |
| 雲 | Cloud | 任何 | — | — | — | — |

## 🔢 數 Domain
- **Collision**：tick **switch / bridge / router** → 每個 interface 行到盡頭或下一個 tick = 1 個（hub、repeater、bus 唔停）。
- **Broadcast**：只 tick **router** → 每個 router interface（共用連線只數一次）= 1 個；**冇 router = 1**。
- L1 device：possibility **↑** size **↑** number **↓**；L2/L3：possibility **↓** size **↓** number **↑**（因為 **filtering**）。
- Review 答案：**Q2 = 7 collision**；**Q4 = 3 broadcast**；**Q3 = segments 3, 4, 5**；課堂大圖 = **15 collision / 5 broadcast**。

## 🔀 Switch 運作
1. **Source MAC + incoming port → 學入 table**（已有 → update timestamp）。
2. **Destination MAC → decision**：
   - Broadcast **FF-FF-FF-FF-FF-FF** 或 **唔喺 table** → **FLOOD**（all ports except incoming）
   - 喺 table、唔同 port → **FORWARD**（only that port）
   - 喺 table、**同一 port** → **FILTER**
3. Timestamp 太舊 → entry 被刪（aging）。Broadcast 永遠 flood（FF… 永遠唔係 source）。
4. Collision-free（microsegmentation）：**dedicated path**（switch 內）、**full duplex**（同 port 同時收發）、**memory buffer**（多份 data 同時出同一 port）。
5. **Full duplex → 唔使 CSMA/CD；port 接 hub 就用唔到 full duplex。**

## 📚 OSI（1→7）：Please Do Not Throw Sausage Pizza Away
| L | Layer | 功能關鍵字 | PDU |
|---|---|---|---|
| 7 | Application | network process to applications、**user interface**（HTTP、Telnet、browser） | Data |
| 6 | Presentation | **data format、compression、encryption** | Data |
| 5 | Session | **establish, manage, terminate sessions** | Data |
| 4 | Transport | **reliability**（TCP / UDP）、**segments**、sequence numbers、ACK、retransmission | **Segment** |
| 3 | Network | **logical address（IP）+ best path / path determination** | **Packet** |
| 2 | Data Link | **physical address（MAC）+ error detection（FCS）**、access to media | **Frame** |
| 1 | Physical | **moves bits**（binary transmission） | **Bits** |

- 最重要三層：**Network > Transport > Data Link**。
- **TCP** reliable（ACK + retransmission）；**UDP** unreliable、快、streaming。
- **ACK → sender**；**FCS → receiver**；**error correction 只喺 Transport**。
- Encapsulation：**Data → Segment → Packet（+IP header）→ Frame（+MAC header & FCS trailer）→ Bits**。
- De-encapsulation：倒轉；收到 bits 要去到 **Data Link** 先睇到 MAC 決定係咪俾自己。
- FCS 唔 match → **discard**。FCS 喺 **trailer**。
- TCP/IP model：**Application、Transport、Internet、Network Access**。

## 🆔 Address
- **MAC**：48 bits = **12 hex**；**OUI = first 6 hex（vendor，IEEE 分配）**；喺 **NIC**；physical、唔變。
- **IPv4**：32 bits = 4 octets（0–255）dotted decimal；logical、位置變就變。IPv6 = 128 bits（hex）。
- Broadcast：MAC **FF-FF-FF-FF-FF-FF**；IPv4 **255.255.255.255**。
- Multicast：MAC **01-00-5E…**；IPv4 **224.0.0.0 – 239.255.255.255**。
- Unicast 1→1；Broadcast 1→all；Multicast 1→group。

## 🌐 Module 1 一句過
- Components：**Devices / Media / Services**。Intermediary roles：**regenerate & retransmit；maintain pathway info；notify errors**。
- Media：copper → **electrical impulses**；fiber → **light**（最快、最安全、貴）；wireless → **EM waves**（最唔安全）。
- LAN：small area、single org、high speed。WAN：interconnect LANs、**service providers**、slower。MAN、WLAN、SAN。
- **Internet** = interconnected LANs & WANs，冇人擁有（IETF、ICANN、IAB）。**Intranet** = 內部；**Extranet** = 俾外部機構人士安全存取。
- Reliable network：**Fault tolerance**（multiple paths、packet switching）、**Scalability**、**QoS**（priority to voice/video）、**Security**（**CIA**）。
- P2P：easy/cheap，但 **no centralized administration、not secure、not scalable、slower**。
- Bandwidth = info per unit time；**kbps / Mbps / Gbps**。
- Topology：**Star** 最常用、中心壞成個網斷；Bus 要 terminator；Mesh = redundancy。

## 🧠 答題心法
- **堂上冇講過嘅選項 → 唔係答案**（速度 Mbps、bytes 長度、converters…）。
- Underline：**physical layer、built its CAM table、within a collision domain、primarily、devices（NIC 唔係 device）**。
- 見到 **hub = bad news**（collision）。見到 **router = broadcast 停**。
