---
oj: dmy
pid: '182'
title: '[R30C]卡牌游戏'
difficulty: 提高
tags:
  - 数学
  - 模运算
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1 \leq N, Q \leq 10^5$，$0 \leq A_i, B_i, C_i, D_i < 998244353$。

## 思路

设当前选择的增益卡为 $(C, D)$。第 $i$ 张基础卡牌生效后的战斗力为 $(A_i + C)(B_i + D)$，总得分为所有基础卡牌战斗力之和。将其展开：

$$
\sum_{i=1}^{N}(A_i + C)(B_i + D) = \sum_{i=1}^{N} A_i B_i + D \sum_{i=1}^{N} A_i + C \sum_{i=1}^{N} B_i + N \cdot C \cdot D
$$

于是可以离线预处理基础卡牌相关的四个量：

- $s_{AB} = \sum A_i B_i$
- $s_A = \sum A_i$
- $s_B = \sum B_i$
- $N$

对于每张增益卡 $(C, D)$，答案即为

$$
\text{ans} = s_{AB} + D \cdot s_A + C \cdot s_B + N \cdot C \cdot D \pmod{998244353}
$$

**关键观察** 是增益卡的效果只通过 $C, D$ 这两个整体参数进入求和式，因此可以把求和符号分配到展开后的每一项，对每一项分别累加预处理值即可，无需对每张增益卡重新遍历所有基础卡牌。

中间乘积的最大值约为 $p^2 \approx 10^{18}$，用 64 位整数即可安全存放，每次乘法后取模。

## 复杂度

- 预处理：$O(N)$。
- 查询：每张增益卡 $O(1)$，共 $O(Q)$。
- 总时间 $O(N + Q)$，空间 $O(1)$（流式读入，不存数组）。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main(): Int64 {
    let reader = getStdIn()
    let p: Int64 = 998244353
    let n = Int64.parse(reader.readln().getOrThrow())
    var sA: Int64 = 0
    var sB: Int64 = 0
    var sAB: Int64 = 0
    for (_ in 0..n) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ x: String => Int64.parse(x) })
        let a = line[0]
        let b = line[1]
        sA = (sA + a) % p
        sB = (sB + b) % p
        sAB = (sAB + (a * b) % p) % p
    }
    let q = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..q) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ x: String => Int64.parse(x) })
        let c = line[0]
        let d = line[1]
        let dsA = (d * sA) % p
        let csB = (c * sB) % p
        let cd = (c * d) % p
        let ncd = (n % p * cd) % p
        let ans = (sAB + dsA + csB + ncd) % p
        println(ans)
    }
    return 0
}
```
