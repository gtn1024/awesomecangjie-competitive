---
oj: dmy
pid: '145'
title: '[R24D]发光的数码管'
difficulty: 提高
tags:
  - 数位DP
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $40\%$ 的数据，$1 \leq l < r \leq 10^6$；对于 $100\%$ 的数据，$1 \leq l < r \leq 10^{18}$。

## 思路

每个数字 $0 \sim 9$ 在 7 段数码管上对应一组亮起的段。相邻数字 $d \to d'$ 的切换次数即为两段集合对称差的元素个数 $\operatorname{popcount}(\text{seg}[d] \oplus \text{seg}[d'])$，与具体的段编号无关。由此可直接列出每次 $+1$ 时单段的变化代价 $\text{cost}[d] = \operatorname{popcount}(\text{seg}[d] \oplus \text{seg}[(d+1) \bmod 10])$：

| $d$ | 0→1 | 1→2 | 2→3 | 3→4 | 4→5 | 5→6 | 6→7 | 7→8 | 8→9 | 9→0 |
|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| cost | 4 | 5 | 2 | 3 | 3 | 1 | 5 | 4 | 1 | 2 |

一个完整循环 $0 \to 1 \to \cdots \to 9 \to 0$ 的代价和为 $30$。

**关键观察 1（前导零不影响）**：题面用前导零把 $l$、$r$ 补齐到相同位数，但前导零位置上的数字始终是 $0$，而 $0 \to 0$ 不产生任何切换。因此无论显示宽度多少，总切换数只取决于数字本身的变化过程，与位数无关。

**关键观察 2（按位独立计数）**：考虑 $x \to x+1$ 这次 $+1$。它会让末尾若干个 $9$ 变成 $0$（每个 $9 \to 0$ 贡献 $\text{cost}[9]$），并把第一个非 $9$ 的数位 $d$ 加 $1$（贡献 $\text{cost}[d]$）；其余数位不动。等价地，每个数位 $p$（权值 $10^p$）在 $x \to x+1$ 中「翻转」当且仅当进位传到了该位，即 $x \bmod 10^p = 10^p - 1$。翻转时该位原来的数字 $v = \lfloor x / 10^p \rfloor \bmod 10$ 决定贡献 $\text{cost}[v]$（包括 $v=9$ 时退化为 $9 \to 0$）。

于是定义前缀和 $S(k) = \sum_{m=0}^{k-1} \text{cost}[m \bmod 10]$，有

$$S(k) = 30 \cdot \left\lfloor \tfrac{k}{10} \right\rfloor + \text{costPrefix}\big[k \bmod 10\big],$$

其中 $\text{costPrefix}[r] = \text{cost}[0] + \cdots + \text{cost}[r-1]$。再定义 $f(n)$ 为从 $0$ 逐步 $+1$ 到 $n$ 的累计切换次数。数位 $p$ 在这段过程中翻转的次数恰好是 $\lfloor n / 10^p \rfloor$，第 $m$ 次（$m = 0, 1, \dots$）的代价是 $\text{cost}[m \bmod 10]$，因此

$$f(n) = \sum_{p \geq 0} S\!\left(\left\lfloor \tfrac{n}{10^p} \right\rfloor\right).$$

最终答案为 $f(r) - f(l)$。

**复杂度**：$f(n)$ 只需对 $p = 0, 1, \dots, 18$ 求和（$n \leq 10^{18}$），时间 $O(\log_{10} n)$，空间 $O(1)$。最大答案约 $3.33 \times 10^{18}$，在 `Int64` 范围内（上限约 $9.2 \times 10^{18}$）。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

// 7-segment transition cost from digit d to (d+1)%10.
// popcount(seg[d] XOR seg[(d+1)%10]) using standard 7-segment encoding.
// cost[d] for d=0..9 where index 9 means 9->0.
// Computed: 0->1:4, 1->2:5, 2->3:2, 3->4:3, 4->5:3, 5->6:1,
//           6->7:5, 7->8:4, 8->9:1, 9->0:2. Full cycle sum = 30.

// prefix[r] = cost[0]+...+cost[r-1], r=0..10
let costPrefix = Array<Int64>(11, { _ => 0 })

func initCost() {
    let cost = [4, 5, 2, 3, 3, 1, 5, 4, 1, 2]
    var s: Int64 = 0
    for (i in 0..10) {
        costPrefix[i] = s
        s += Int64(cost[i])
    }
    costPrefix[10] = s
}

// S(k) = sum of first k terms of cost[0],cost[1],... (cycling)
func S(k: Int64): Int64 {
    let cycles = k / 10
    let rem = k % 10
    return cycles * 30 + costPrefix[rem]
}

// f(n) = total toggles from incrementing 0->1->...->n.
// For each position p (weight 10^p), the digit at p flips each time the
// increment carries into it, i.e. count_p = floor(n / 10^p) flips; the
// cost of the m-th flip (m=0..count_p-1) is cost[m mod 10].
func f(n: Int64): Int64 {
    var sum: Int64 = 0
    var pow10: Int64 = 1
    while (pow10 <= n) {
        let count = n / pow10
        sum += S(count)
        if (pow10 <= n / 10) {
            pow10 *= 10
        } else {
            break
        }
    }
    return sum
}

main() {
    initCost()
    let reader = getStdIn()
    let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let l = Int64.parse(parts[0])
    let r = Int64.parse(parts[1])
    let ans = f(r) - f(l)
    println(ans)
}
```
