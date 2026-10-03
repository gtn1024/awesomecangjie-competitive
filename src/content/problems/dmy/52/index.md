---
oj: dmy
pid: '52'
title: '[R9D] 战队选人'
difficulty: 提高
tags:
  - 组合计数
  - 组合数
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le a, c, n, m \le 5000$，$0 \le b \le 5000$。

## 思路

语文好的 $a$ 人只能给小 N 选、英语好的 $c$ 人只能给小 M 选，数学好的 $b$ 人则两边都可能选，但要保证每人最多进一个战队。因此只需枚举数学组怎么分配：设小 N 从数学组选了 $i$ 人、小 M 从剩下的数学组选了 $j$ 人，则小 N 还需从语文组选 $n - i$ 人、小 M 还需从英语组选 $m - j$ 人。可行性要求 $n - i \le a$、$i + j \le b$、$m - j \le c$。

这类方案数为

$$\binom{a}{n-i} \cdot \binom{b}{i} \cdot \binom{b-i}{j} \cdot \binom{c}{m-j}$$

对合法的 $(i, j)$ 求和即可。组合数用杨辉三角 $O(V^2)$ 预处理（$V = \max\{a,b,c,n,m\}$），过程对 $998244353$ 取模。

复杂度：时间 $O(V^2)$，空间 $O(V^2)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

let MOD: Int64 = 998244353

main(): Int64 {
    let reader = getStdIn()
    let v = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let a = v[0]
    let b = v[1]
    let c = v[2]
    let n = v[3]
    let m = v[4]
    var V: Int64 = a
    if (b > V) { V = b }
    if (c > V) { V = c }
    if (n > V) { V = n }
    if (m > V) { V = m }
    let N = V + 1
    let C = Array<Array<Int64>>(N, { _ => Array<Int64>(N, { _ => 0 }) })
    for (i in 0..=V) {
        C[i][0] = 1
        C[i][i] = 1
    }
    for (i in 2..=V) {
        for (j in 1..i) {
            C[i][j] = (C[i - 1][j - 1] + C[i - 1][j]) % MOD
        }
    }
    func comb(n0: Int64, k: Int64): Int64 {
        if (k < 0 || k > n0 || n0 < 0) {
            return 0
        }
        return C[n0][k]
    }
    var ans: Int64 = 0
    var i: Int64 = 0
    while (i <= n) {
        if (i <= b) {
            var j: Int64 = 0
            while (j <= m) {
                if (i + j <= b && (n - i) <= a && (m - j) <= c) {
                    let term = comb(a, n - i) * comb(b, i) % MOD
                    let term2 = term * comb(b - i, j) % MOD
                    let term3 = term2 * comb(c, m - j) % MOD
                    ans = (ans + term3) % MOD
                }
                j += 1
            }
        }
        i += 1
    }
    println(ans)
    return 0
}
```

</details>

要点：

- 把「两边都可能选」的数学组作为分配对象枚举，其余两组各归一边，方案数就落到一组组合数乘积上。
- $\binom{b}{i}\binom{b-i}{j}$ 直接体现「先选 $i$ 给 N、再从剩余里选 $j$ 给 M」，无需去重。
