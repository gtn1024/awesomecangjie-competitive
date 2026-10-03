---
oj: dmy
pid: '159'
title: '[R26F]勇者斗恶龙'
difficulty: 提高
tags:
  - 动态规划
timeLimit: 1s
memoryLimit: 512m
---

## 思路

设第 $i$ 回合选择「攻击」当且仅当 $i$ 属于集合 $S$，其余回合提升攻击力。攻击时造成的伤害为当前攻击力加上 $b_i$，而当前攻击力等于此前所有提升回合的 $a_j$ 之和。于是总伤害可以拆成两部分：

$$
\sum_{i \in S} b_i + \sum_{j \notin S} a_j \times (\text{第 } j \text{ 回合之后攻击的次数})
$$

即每个提升回合的贡献等于 $a_j$ 乘以它之后发动的攻击次数。这样就不需要记录攻击力具体数值，只要知道「后面选了多少次攻击」。

从右往左做动态规划：设 $dp[k]$ 表示已经处理过的后缀回合中恰好选择了 $k$ 次攻击时的最大贡献。处理第 $i$ 回合时：

- 选择攻击：贡献 $b_i$，攻击次数加一，$dp_{new}[k] = dp[k - 1] + b_i$；
- 选择提升：之后有 $k$ 次攻击受益，$dp_{new}[k] = dp[k] + a_i \times k$。

两者取最大。答案取处理完所有回合后 $dp$ 的最大值。复杂度 $O(n^2)$，$n \le 3000$ 轻松通过；伤害上限约 $9 \times 10^{15}$，需用 64 位整数，非法状态用极小值初始化。

## 代码

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let nn = n
    var dp = Array<Int64>(nn + 1, { _ => -4611686018427387904 })
    dp[0] = 0
    var i = nn - 1
    while (i >= 0) {
        let ndp = Array<Int64>(nn + 1, { _ => 0 })
        var k = 0
        while (k <= nn) {
            var best = dp[k] + a[i] * k
            if (k > 0) {
                let cand = dp[k - 1] + b[i]
                if (cand > best) {
                    best = cand
                }
            }
            ndp[k] = best
            k += 1
        }
        dp = ndp
        i -= 1
    }
    var ans = dp[0]
    var k = 1
    while (k <= nn) {
        if (dp[k] > ans) {
            ans = dp[k]
        }
        k += 1
    }
    println(ans)
    0
}
```

</details>
