---
oj: dmy
pid: '225'
title: '[R37D]斜三进制'
difficulty: 提高
tags:
  - 数学
  - 进制
timeLimit: 1s
memoryLimit: 512m
---

## 题目

猫头鹰国的数只由 $0,1,2,3$ 四个数字组成，定义后继规则如下：

- 若数中存在数字 $3$（这样的位唯一），则把该位替换为 $0$，并将更高的一位加一；
- 否则只把个位加一。

按此规则从 $0$ 开始计数，前若干个数为 $0,1,2,3,10,11,12,13,20,21,22,23,30,100,\dots$。给定一个长度为 $n$ 的合法猫头鹰国数串 $s$，请把它翻译成十进制数。

> 对于 $100\%$ 的数据，$1\le n\le 30$，$|s|=n$，且 $s$ 是合法的猫头鹰国数。

## 思路

关键在于识别这是 **斜三进制（skew ternary / biased ternary）**：每位允许的数字是 $0,1,2,3$，但进位不是逢三进一，而是「出现 3 时整体消去并向上跳」，因此每位的位权不是 $3^i$，而是一个等比 +1 的递推序列。

设第 $i$ 位（从个位起 $i=0$）的位权为 $T_i$。由后继规则可推出递推：当某位从 $3$ 变 $0$ 时，相当于该位的贡献从 $3T_i$ 跌回 $0$，而更高位 $+1$ 贡献 $T_{i+1}$，要保持连续的后继关系必须有

$$T_{i+1} = 3T_i + 1, \qquad T_0 = 1.$$

解得显式

$$T_i = \frac{3^{i+1}-1}{2}, \quad \text{即 } 1,4,13,40,121,\dots$$

于是任意猫头鹰国数 $s = d_{n-1}\dots d_1 d_0$（$d_0$ 为个位）的十进制值为

$$v = \sum_{i=0}^{n-1} d_i \cdot T_i.$$

用样例验证：

- $23 = 2\cdot T_1 + 3\cdot T_0 = 2\cdot4 + 3 = 11$；
- $10130 = 1\cdot121 + 0\cdot40 + 1\cdot13 + 3\cdot4 + 0\cdot1 = 146$。

合法猫头鹰国数保证了「3 至多出现一次」等约束，但对于翻译这道题，由于题面保证输入合法，直接按上述位权求和即可，无需校验合法性。

规模上 $n\le30$，最大位权 $T_{29}\approx 1.0\times10^{14}$，总和不超过约 $3\times10^{15}$，`Int64` 足够。

## 复杂度

- 时间复杂度：$O(n)$，从个位向高位扫描一遍累加。
- 空间复杂度：$O(n)$ 存输入串，位权边算边递推无需数组。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.console.*
import std.convert.*

main() {
    let reader = Console.stdIn
    let n = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow()
    // 位权 T_i = (3^(i+1) - 1) / 2，递推 T_{i+1} = 3*T_i + 1，T_0 = 1
    // 从个位（字符串末尾）开始处理
    var weight: Int64 = 1
    var answer: Int64 = 0
    var i = n - 1
    while (i >= 0) {
        let digit = Int64(UInt32(s.toRuneArray()[Int64(i)]) - UInt32(r'0'))
        answer += digit * weight
        weight = 3 * weight + 1
        i -= 1
    }
    println(answer)
}
```

</details>
