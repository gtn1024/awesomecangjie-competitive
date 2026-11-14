---
oj: dmy
pid: '563'
title: '简单字符串'
difficulty: 提高
tags:
  - 线性 DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1\le n\le 10^5$，$s$ 只含小写英文字母，$1\le a_i\le 998244353$。

## 思路

**状态就是「已经匹配了 `hard` 的多长前缀」。** 固定一组保留的字符后，判断这串里有没有 `hard` 子序列的标准做法是贪心：从 `hard` 的第 $0$ 个字符开始，从左往右扫保留的字符，遇到当前要找的字符就把它配掉、指针后移，指针走到 $4$ 就说明 `hard` 出现了。贪心每次都用最早的可能位置去配，所以它配出的长度就是「`hard` 的最长前缀中，能作为当前字符串子序列的那一个」——既不可能更短（贪心是能配到最长的），也不可能更长。于是「扫描中的指针位置 $j$」就是保留下来的前缀串的一个确定函数，只由 $j$ 与下一个字符决定，与之前删了哪些字符无关，这正是 DP 需要的无后效性。

因此在处理完前 $i$ 个原字符之后，只需知道指针停在 $j$（$j=0,1,2,3$）。$j=4$ 表示已经出现了 `hard`，是非法局面，不能进入。

**转移。** 设 $dp_j$ 为当前指针停在 $j$ 的最小花费，读入第 $i$ 个字符 $c$、删除代价 $a_i$（记 $\mathrm{hard}_j$ 为 `hard` 的第 $j$ 个字符，$\mathrm{hard}_0$ 就是 `h`）：

- 删除 $c$：指针不变，代价增加 $a_i$，即 $nd_j\leftarrow dp_j+a_i$；
- 保留 $c$ 且它正好是 $\mathrm{hard}_j$：指针前进一位，即 $nd_{j+1}\leftarrow dp_j$；
- 保留 $c$ 而它不推进指针：指针不变、不花代价，即 $nd_j\leftarrow dp_j$。

三式都取 $\min$ 合起来写就是：先把 $nd_j$ 全部置为 $dp_j+a_i$，再按 $c$ 与 $\mathrm{hard}_j$ 是否相等，从 $dp_j$ 无代价地更新 $nd_j$（不推进）或 $nd_{j+1}$（推进）。

**为什么每个状态只留最小值就够。** 转移完全由「$j$ 与当前字符是保留还是删除」决定，并且 $j$ 是单调不减的；同一 $j$ 下的两个不同删除方案对后续的影响完全相同，因此只需保留花费最小的那个。这也是本题能压到只有 $4$ 个状态的原因。

**$j=3$ 且 $c=\texttt{'d'}$ 是唯一必须删除的情形。** 此时保留会推进到 $j=4$，直接构造出一个 `hard`。所以这一格只能走「删除」的转移，实现里要跳过「保留不推进」那一支，否则会把「已经凑成 `hard`」的方案当成合法方案继续往下算。

**边界与答案。** 初始 $dp_0=0$，其余为 $+\infty$（表示还配不出对应长度的前缀）。扫描结束后 $j=4$ 永远是 $+\infty$（它从不参与转移），而每个 $dp_j$（$j\le 3$）都对应一个不含 `hard` 子序列的删除方案，所以答案是 $\min_{j<4}dp_j$。$s$ 本身不含 `hard` 时全部字符都可以保留，答案自然是 $0$。

## 复杂度

一次线性扫描，每个位置做常数次（$4$ 个状态）转移，时间 $O(n)$，额外空间 $O(1)$（只存 $4$ 个状态和读入的代价数组）。

## 仓颉实现

字符串按字节读入，`hard` 也转成字节数组比较，避免逐字符转换。无穷大取 $2^{60}$，与 $n\cdot a_i\le 10^{14}$ 相比足够大且不会在累加时溢出。

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let sc = reader.readln().getOrThrow().toArray()
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let hb = "hard".toArray()
    let inf: Int64 = 1 << 60
    var dp = Array<Int64>(4, { _ => inf })
    dp[0] = 0
    var i: Int64 = 0
    while (i < n) {
        let c = sc[i]
        let cost = a[i]
        var nd = Array<Int64>(4, { _ => inf })
        for (j in 0..4) {
            nd[j] = dp[j] + cost
        }
        for (j in 0..4) {
            if (j == 3 && c == hb[3]) {
                continue
            } else if (j < 3 && c == hb[j]) {
                if (dp[j] < nd[j + 1]) { nd[j + 1] = dp[j] }
            } else {
                if (dp[j] < nd[j]) { nd[j] = dp[j] }
            }
        }
        dp = nd
        i += 1
    }
    var ans = dp[0]
    for (j in 1..4) {
        if (dp[j] < ans) { ans = dp[j] }
    }
    println(ans)
}
```

</details>
