---
oj: dmy
pid: '371'
title: '[R59F] 数汉堡'
difficulty: 普及+/提高
tags:
  - 数位 DP
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$n \le 10^{2000}$（最多 2000 位），$|t| \le n$ 的位数，$t$ 不含数字 `0`。

## 思路

要统计 $1 \sim n$ 中十进制表示以 $t$ 为**子序列**的数的个数。$n$ 可达 $10^{2000}$，必须把 $n$ 当作字符串做**数位 DP**。

**贪心匹配自动机**：处理一个数字串时，只需记录 $j$ = 已匹配的 $t$ 的最长前缀长度。读入数字 $c$ 时，若 $j < |t|$ 且 $c = t[j]$，则 $j$ 加一；否则 $j$ 不变。正确性：任何匹配 $t[0..k]$ 的方式若最后一位使用 $c$，则要求 $c = t[k]$ 且 $t[0..k-1]$ 已经匹配；而贪心已经匹配了尽可能长的前缀，所以只有 $c = t[j]$ 时才能推进。

**数位 DP**：把所有数看作等长的 $L$ 位串（$L$ 为 $n$ 的位数），高位补 0。由于 $t$ 不含数字 `0`，前导 0 永远不会推进匹配，因此补零不影响结果；$x = 0$ 也不可能匹配，无需额外处理。按位从高位到低位枚举：

- 前缀与 $n$ 完全一致（紧贴）的路径只有一条，用标量 $j_t$ 维护，当前位只能选 $d$（$n$ 的这一位）；
- 前缀已严格小于 $n$（松绑）的路径用数组 $dp[j]$ 维护方案数。

对松绑状态，转移可以整段合并成 $O(1)$ 公式：状态 $j < m$ 时，除了数字 $t[j]$ 会推进到 $j+1$，其余 9 个数字都保持 $j$；状态 $m$ 已完全匹配，10 个数字都保持 $m$。于是每位的松绑转移为

$$
dp'[j] = 9 \cdot dp[j] + dp[j-1] \quad (1 \le j < m)
$$

$$
dp'[0] = 9 \cdot dp[0], \qquad dp'[m] = 10 \cdot dp[m] + dp[m-1]
$$

紧贴路径的贡献：当前位 $d$，若 $j_t < m$，选 $c \in [0, d-1]$ 时，恰有一个 $c = t[j_t]$（当 $t[j_t] < d$ 时存在）进入 $j_t+1$，其余 $d-1$ 或 $d$ 个进入 $j_t$；若 $j_t = m$，则 $d$ 个数字全部进入状态 $m$。紧贴路径自身选 $c = d$：若 $t[j_t] = d$，则 $j_t$ 加一。

最终答案为 $dp[m] + [j_t = m]$（后者对应 $n$ 本身）。

复杂度：时间 $O(L \cdot m)$（$L, m \le 2000$），空间 $O(m)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*

main() {
    let reader = getStdIn()
    // n 可达 10^2000，按字符串读入
    let ns = reader.readln().getOrThrow()
    let t = reader.readln().getOrThrow()
    let L = ns.size
    let m = t.size
    let mod = 998244353
    let size = m + 1
    // 各位数字
    let nd = Array<Int64>(L, { i: Int64 => Int64(ns[i]) - 48 })
    let td = Array<Int64>(m, { i: Int64 => Int64(t[i]) - 48 })
    var loose = Array<Int64>(size, { _: Int64 => 0 })
    // jt：与 n 前缀完全一致（紧贴）的路径上，已匹配 t 的最长前缀长度
    var jt: Int64 = 0
    for (i in 0..L) {
        let d = nd[i]
        var nxt = Array<Int64>(size, { _: Int64 => 0 })
        // 已松绑（前缀严格小于 n）的状态转移：
        // 状态 j（j < m）只有一位数字 t[j] 能推进到 j+1，其余 9 位保持 j；
        // 状态 m 已完全匹配，任何数字都保持 m
        for (j in 0..size) {
            if (j < m) {
                nxt[j] = (9 * loose[j] + (if (j > 0) { loose[j - 1] } else { 0 })) % mod
            } else {
                nxt[j] = (10 * loose[j] + loose[j - 1]) % mod
            }
        }
        // 紧贴路径选择比 d 小的数字，进入松绑状态
        if (jt < m) {
            let adv = if (td[jt] < d) { 1 } else { 0 }
            nxt[jt] = (nxt[jt] + d - adv) % mod
            if (adv == 1) {
                nxt[jt + 1] = (nxt[jt + 1] + 1) % mod
            }
        } else {
            nxt[m] = (nxt[m] + d) % mod
        }
        // 紧贴路径自身选数字 d
        if (jt < m && td[jt] == d) {
            jt = jt + 1
        }
        loose = nxt
    }
    let ans = (loose[m] + (if (jt == m) { 1 } else { 0 })) % mod
    println(ans)
}
```

</details>

要点：

- 紧贴路径只有一条，无需 DP 数组，用标量 $j_t$ 模拟即可；松绑路径按位整体转移，把每位 10 次状态枚举压成 $O(m)$。
