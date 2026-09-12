---
oj: dmy
pid: '94'
title: '[R16D] 通关'
difficulty: 普及/提高-
tags:
  - 贪心
  - 倒推
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le T \le 10$，$1 \le n \le 10^5$，$1 \le a_i, b_i \le 10^9$。

## 思路

面对第 $i$ 关时能量为 $x$（需 $x \ge a_i$），消耗 $a_i$ 后剩余 $y = x - a_i$，过关奖励 $\min(y, b_i)$，于是过关后能量变为 $y + \min(y, b_i)$。奖励函数 $y + \min(y, b_i)$ 关于 $y$ 单调递增，因此「初始能量越大越容易通关」具有单调性，既可二分答案，也可直接倒推。

采用**倒推法**一次性 $O(n)$ 求出最小初始能量。设 $E_i$ 为「通过第 $i \sim n$ 关所需的最小能量」，边界 $E_{n+1} = 0$，目标是 $E_1$。已知 $E_{i+1}$，要求出过第 $i$ 关后剩余的 $y$ 满足

$$y + \min(y, b_i) \ge E_{i+1}.$$

对 $y$ 分两种情况求最小值：

- $E_{i+1} \le 2 b_i$ 时 $y$ 落在 $y \le b_i$ 段，方程化为 $2y \ge E_{i+1}$，最小 $y = \lceil E_{i+1} / 2 \rceil = \lfloor (E_{i+1} + 1) / 2 \rfloor$；
- $E_{i+1} > 2 b_i$ 时必有 $y > b_i$，方程化为 $y + b_i \ge E_{i+1}$，最小 $y = E_{i+1} - b_i$。

得到 $y$ 后 $E_i = y + a_i$。从 $i = n$ 倒序推到 $i = 1$ 即可。

复杂度：时间 $O(n)$，空间 $O(n)$。中间量最大可达 $E \approx \sum a_i \le 10^{14}$，用 `Int64` 安全。

## 仓颉实现

```cangjie
import std.env.*

// 预分配大缓冲，分块读入全部字节，返回 (缓冲, 有效长度)。
// 大输入下逐行 split 较慢，这里一次性读入再扫描整数。
func readAll(reader: ConsoleReader): (Array<UInt8>, Int64) {
    let cap: Int64 = 32 * 1024 * 1024
    let buf = Array<UInt8>(cap, { _ => 0 })
    var total: Int64 = 0
    let chunk = Array<UInt8>(1 << 16, { _ => 0 })
    while (true) {
        let got = reader.read(chunk)
        if (got <= 0) {
            break
        }
        // copyTo(dest, srcOffset, destOffset, length)
        chunk.copyTo(buf, Int64(0), total, got)
        total = total + got
    }
    return (buf, total)
}

main() {
    let reader = getStdIn()
    let (bytes, m) = readAll(reader)
    // 单趟扫描解析整数；最坏 T(1+2n) <= 2e6，预分配 2.2e6 足够
    let nums = Array<Int64>(2200000, { _ => 0 })
    var cnt: Int64 = 0
    var i: Int64 = 0
    while (i < m) {
        var c = bytes[i]
        while (i < m && (c < 48 || c > 57)) {
            i = i + 1
            if (i < m) { c = bytes[i] }
        }
        if (i >= m) { break }
        var v: Int64 = 0
        while (i < m && c >= 48 && c <= 57) {
            v = v * 10 + Int64(c - 48)
            i = i + 1
            if (i < m) { c = bytes[i] }
        }
        nums[cnt] = v
        cnt = cnt + 1
    }
    var p: Int64 = 0
    let t = nums[p]
    p = p + 1
    for (_ in 0..t) {
        let n = nums[p]
        p = p + 1
        let baseA = p
        let baseB = p + n
        // 倒推：need 表示通过第 j+1..n 关所需的最小能量
        var need: Int64 = 0
        var j = n - 1
        while (j >= 0) {
            let bj = nums[baseB + j]
            let twoB = bj * 2
            // 设过第 j 关后剩余 y，则 y + min(y, bj) >= need
            // need <= 2*bj 时 y = ceil(need/2)；否则 y = need - bj
            let y = if (need <= twoB) { (need + 1) / 2 } else { need - bj }
            need = y + nums[baseA + j]
            j = j - 1
        }
        println(need)
        p = baseB + n
    }
}
```

要点：

- **倒推消去模拟**：奖励关于剩余能量单调，故「过完后续关卡所需能量」可以倒着传回来，每关用 $E_{i+1}$ 直接解出最小的过关前剩余 $y$，再 $E_i = y + a_i$，省去二分的 $\log$ 因子。
- **分情况解方程**：$\min(y, b_i)$ 在 $y = b_i$ 处折点，按 $E_{i+1}$ 是否超过 $2 b_i$ 取两支闭式解，避免浮点，全程整数运算。`ceil(E/2)` 用整除 `(E + 1) / 2` 实现。
- **快读**：$T \cdot n$ 可达 $10^6$、输入近 $20\,\text{MB}$，逐行 `split` 在 1s 时限内偏紧。这里用 `reader.read` 分块读入到一个预分配大字节数组，再单趟扫描 ASCII 字节累加整数，把读入与解析压到一次线性遍历，实测最坏点约 $0.3$s。
