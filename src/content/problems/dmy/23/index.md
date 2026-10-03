---
oj: dmy
pid: '23'
title: '[R4E] 区间异或和'
difficulty: 入门
tags:
  - 位运算
  - 前缀和
timeLimit: 1s
memoryLimit: 512m
---

## 思路

设前缀异或 $S_i = A_1 \oplus A_2 \oplus \dots \oplus A_i$（$S_0 = 0$），则

$$XORsum(l, r) = S_{l-1} \oplus S_r$$

题目所求即所有二元组 $(i, j)$（$0 \le i < j \le n$）的 $S_i \oplus S_j$ 之和。

异或运算按位独立，对第 $b$ 位，只有两个前缀在这一位上不同时才对答案贡献 $2^b$。设 $n+1$ 个前缀中第 $b$ 位为 $1$ 的有 $ones$ 个，则该位贡献 $ones \times (n+1-ones) \times 2^b$。逐位累加即可。

复杂度：时间 $O(n \log V)$（$V = \max A_i$），空间 $O(\log V)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

func solve() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let nn = n
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let cnt = Array<Int64>(32, { _ => 0 })
    var x: Int64 = 0
    for (v in a) {
        x ^= v
        for (b in 0..32) {
            if (((x >> b) & 1) == 1) {
                cnt[b] += 1
            }
        }
    }
    let total = nn + 1
    var ans: Int64 = 0
    for (b in 0..32) {
        let ones = cnt[b]
        ans += ones * (total - ones) * (Int64(1) << b)
    }
    println(ans)
}

main() {
    solve()
}
```

</details>
