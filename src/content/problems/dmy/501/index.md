---
oj: dmy
pid: '501'
title: 带权选数
difficulty: 普及
tags:
  - 线性DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le M \le N \le 2000$，$-10^9 \le a_i \le 10^9$。

## 思路

按原序列顺序逐个决策「这个数选还是不选」，同时记录已经选了几个。关键在于：一个数的贡献系数只取决于它是**第几个**被选的，与后面的选择无关，所以状态里带上「已选个数」就足够了。

设 $dp_i[j]$ 表示只考虑前 $i$ 个数、恰好选了 $j$ 个时的最大总分。对第 $i$ 个数：

- 不选 $a_i$：$dp_i[j] = dp_{i-1}[j]$；
- 选 $a_i$：它一定是第 $j$ 个被选的数，贡献 $j \cdot a_i$，即 $dp_i[j] = dp_{i-1}[j-1] + j \cdot a_i$。

两者取较大值，答案为 $dp_N[M]$。

几个容易出错的地方：

- **必须恰好选 $M$ 个**。$j > i$ 的状态不可达，用一个远小于任何合法答案的哨兵值（取 $-2^{62}$）标记，且只允许从可达状态转移，否则会从「假的」状态拼出答案。
- **$a_i$ 可以为负，且负值可能必须选**。因为选够 $M$ 个是硬性要求，不能为了避开负数而少选，转移式会自然地把这些负贡献算进去，不需要额外特判。
- **答案可能很大**。单个数贡献至多 $2000 \times 10^9 = 2\times 10^{12}$，总和在 $2 \times 10^{15}$ 量级，超出 32 位整数范围，要用 64 位整数。

第 $i$ 轮只依赖第 $i-1$ 轮，因此把 $dp$ 压成一维：$j$ 从 $M$ 递减到 $1$ 更新（与 0/1 背包同理），这样用到的 $dp[j-1]$ 仍是上一轮的值，不会被本轮覆盖。

## 复杂度

时间 $O(NM)$，额外空间 $O(M)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let m = first[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let neg: Int64 = -4611686018427387904
    var dp = Array<Int64>(m + 1, { _ => neg })
    dp[0] = 0
    var i: Int64 = 0
    while (i < n) {
        let x = a[i]
        var j = m
        while (j >= 1) {
            if (dp[j - 1] != neg) {
                let cand = dp[j - 1] + j * x
                if (cand > dp[j]) {
                    dp[j] = cand
                }
            }
            j -= 1
        }
        i += 1
    }
    println(dp[m])
}
```

</details>
