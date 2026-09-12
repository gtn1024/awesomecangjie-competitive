---
oj: dmy
pid: '207'
title: '[R34D]完美字符串'
difficulty: 提高
tags:
  - 前缀和
  - 哈希
timeLimit: 1.5s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，字符串长度为 $3n$，仅由 `A`、`B`、`C` 构成。

## 思路

一次操作选定区间 $[l, r]$ 与字符 $c$，把区间内全部改成 $c$。设原串中 `A/B/C` 的总数分别为 $\text{cntA},\text{cntB},\text{cntC}$，操作后三者的总数变为：

- $c$ 的总数 $=\text{cnt}_c - (\text{区间内 }c\text{ 数}) + (r-l+1)$；
- 另外两个字符 $X, Y$ 的总数 $=\text{cnt}_X - (\text{区间内 }X\text{ 数})$ 与 $\text{cnt}_Y - (\text{区间内 }Y\text{ 数})$。

要使三者都等于 $n$。由于字符总数恒为 $3n$，**只要 $X$ 与 $Y$ 同时达到 $n$，$c$ 必然也是 $n$**，故只需约束 $X,Y$：

$$
\text{区间内 }X\text{ 数} = \text{cnt}_X - n = p_x,\qquad \text{区间内 }Y\text{ 数} = \text{cnt}_Y - n = p_y.
$$

$p_x, p_y$ 是**固定常数**。若任一为负（对应字符在原串中本就不足 $n$ 个），该 $c$ 无解。

**枚举 $c \in \{A, B, C\}$，对固定 $c$ 计数满足上述条件的区间数，最后求和。**

### 转化为二维前缀和匹配

设 $\text{preX}[i]$、$\text{preY}[i]$ 分别为前 $i$ 个字符中 $X$、$Y$ 的个数。区间 $[l, r]$ 满足

$$
\text{preX}[r] - \text{preX}[l-1] = p_x,\quad \text{preY}[r] - \text{preY}[l-1] = p_y.
$$

即对每个 $r$，要统计 $l-1 \in [0, r-1]$ 中满足 $\text{preX}[l-1] = \text{preX}[r] - p_x$ 且 $\text{preY}[l-1] = \text{preY}[r] - p_y$ 的个数。

用一个哈希表维护已经出现过的 $(\text{preX}, \text{preY})$ 二元组计数，从左到右扫描 $r$，每次查询 $(\text{preX}[r]-p_x,\ \text{preY}[r]-p_y)$ 的出现次数累加到答案，再把当前的 $(\text{preX}[r], \text{preY}[r])$ 计入哈希表即可。初始时 $l-1=0$ 对应 $(0,0)$。

### 哈希键编码

二元组 $(a, b)$ 需要做成单一键值。由于 $|a|, |b| \le 2n \le 4 \times 10^5$，取一个比此范围更大的基数 $\text{BASE} = 900001$，编码 $a \times \text{BASE} + b$ 即可保证单射。这样用 `HashMap<Int64, Int64>` 避免**字符串拼接**（每步都要分配新 `String`，常数极大），实测把最坏数据从 1.27s 降到 0.10s。

## 复杂度

每个 $c$ 一次 $O(n)$ 扫描，哈希表插入与查询均摊 $O(1)$，共三个 $c$，总时间 $O(n)$。空间 $O(n)$（哈希表至多存 $n+1$ 个二元组）。

## 代码

```cangjie
import std.convert.*
import std.collection.*
import std.env.*

// 枚举操作目标字符 c，另两字符记为 X、Y。
// 操作把区间 [l,r] 全部改成 c 后，要让 A/B/C 各 n 次。
// 由于字符总数恒为 3n，等价于：区间内 X 的个数恰好为 px=cntX-n、
// 区间内 Y 的个数恰好为 py=cntY-n（此时区间内 c 个数自动使 c 总数=n）。
// 用前缀和 preX/preY，对每个 r 找 l-1 使 preX[l-1]=preX[r]-px 且 preY[l-1]=preY[r]-py。
func countForTarget(bytes: Array<UInt8>, n: Int64, charX: UInt8, charY: UInt8, cntX: Int64, cntY: Int64, map: HashMap<Int64, Int64>): Int64 {
    let px = cntX - n
    let py = cntY - n
    if (px < 0 || py < 0) {
        return 0
    }
    map.clear()
    // 编码：(preX,preY) -> preX * BASE + preY，BASE 取足够大保证单射
    let BASE: Int64 = 900001
    // l-1=0 时 (preX,preY)=(0,0)
    map[0] = Int64(1)
    var preX: Int64 = 0
    var preY: Int64 = 0
    var total: Int64 = 0
    for (i in 0..bytes.size) {
        let ch = bytes[i]
        if (ch == charX) {
            preX = preX + 1
        } else if (ch == charY) {
            preY = preY + 1
        }
        // 需要的 l-1 对应前缀和
        let needKey = (preX - px) * BASE + (preY - py)
        let v = map.get(needKey)
        match (v) {
            case Some(c) => total = total + c
            case None => ()
        }
        // 当前位置作为新的 l-1 候选
        let curKey = preX * BASE + preY
        let p = map.get(curKey)
        match (p) {
            case Some(c2) => map[curKey] = c2 + Int64(1)
            case None => map[curKey] = Int64(1)
        }
    }
    return total
}

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow()
    let m = s.size
    let bytes = Array<UInt8>(m, { i: Int64 => s[i] })

    var cntA: Int64 = 0
    var cntB: Int64 = 0
    var cntC: Int64 = 0
    for (i in 0..m) {
        let ch = bytes[i]
        if (ch == b'A') {
            cntA = cntA + 1
        } else if (ch == b'B') {
            cntB = cntB + 1
        } else {
            cntC = cntC + 1
        }
    }

    let map = HashMap<Int64, Int64>()
    var ans: Int64 = 0
    // c=A, X=B, Y=C
    ans = ans + countForTarget(bytes, n, b'B', b'C', cntB, cntC, map)
    // c=B, X=A, Y=C
    ans = ans + countForTarget(bytes, n, b'A', b'C', cntA, cntC, map)
    // c=C, X=A, Y=B
    ans = ans + countForTarget(bytes, n, b'A', b'B', cntA, cntB, map)

    println(ans)
}
```
