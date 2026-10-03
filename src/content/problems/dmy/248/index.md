---
oj: dmy
pid: '248'
title: '[R40E] Yet another counting problem'
difficulty: 提高
tags:
  - 动态规划
  - 组合计数
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 3000$，$0 \le a_i \le n$。

## 思路

先把 $B$ 中的点按 $a$ 从小到大排序，排序后的编号越大，能连的范围越大。枚举 $k$：排序后编号最大（即 $a$ 最大）的**不在匹配中**的 $B$ 点。此时点分成 4 类：

1. 集合 1：$A_1 \dots A_{a_k}$；
2. 集合 2：$A_{a_k+1} \dots A_n$；
3. 集合 3：$B_1 \dots B_{k-1}$；
4. 集合 4：$B_{k+1} \dots B_n$。

由极大性可知集合 1 和集合 4 中的点**全部在匹配中**：若集合 1 有未匹配点，则未匹配的 $B_k$ 可以连它；若集合 4 有未匹配点，则 $k$ 就不是编号最大的未匹配点。于是匹配中的边只可能是三类：集合 1 ↔ 集合 3、集合 1 ↔ 集合 4、集合 2 ↔ 集合 4。

**集合 3 与集合 1 之间的匹配**：设 $f_{i,j}$ 表示排序后前 $i$ 个 $B$ 点中恰好匹配了 $j$ 个 $A$ 点的方案数，转移为

$$f_{i,j} = f_{i-1,j} + f_{i-1,j-1} \cdot \max(0,\ a_i - (j-1))$$

$B_i$ 不匹配贡献 $f_{i-1,j}$；若匹配，它可连 $A_1 \dots A_{a_i}$，其中 $j-1$ 个已被前面的点占用，故有 $a_i - (j-1)$ 种选择。枚举集合 1 与集合 3 的连边数 $x$，方案数为 $f_{k-1,x}$。

**填补集合 1 剩余空位**：集合 1 共 $a_k$ 个位置，被集合 3 占去 $x$ 个后还剩 $a_k - x$ 个，必须由集合 4 完全覆盖。集合 4 共 $n-k$ 个点，其中 $z = (n-k) - (a_k - x)$ 个去匹配集合 2，剩下 $a_k - x$ 个填入集合 1 的空位，这部分是全排列 $(a_k - x)!$。

**集合 4 匹配集合 2**：设 $g_k[z]$ 表示从 $B_{k+1 \dots n}$ 中选 $z$ 个点匹配到 $A_{a_k+1 \dots n}$ 的方案数。固定 $k$ 时 $B$ 点能连的范围不同（$B_j$ 只能连到 $A_{a_j}$），所以不能直接套组合数，需要递推：当 $k$ 减小 1 时，集合 2 新增 $L = a_k - a_{k-1}$ 个空位 $A_{a_{k-1}+1} \dots A_{a_k}$，这些空位的下标都不超过 $a_k$，可被集合 4（$B_k \dots B_n$，共 $M = n-k+1$ 个点）中任意点连接。把 $L$ 个空位逐个加入，每个空位要么不用，要么选一个未匹配的 $B$ 点占用：

$$g'[z] = g[z] + g[z-1] \cdot (M - z + 1)$$

因此固定 $k$ 对答案的贡献为

$$\sum_{x} f_{k-1,x} \cdot g_k[(n-k) - (a_k - x)] \cdot (a_k - x)!$$

最后，$B$ 全部匹配即完美匹配的情况单独计入 $f_{n,n}$。

复杂度：时间 $O(n^2)$（各次转移中 $L$ 的总和不超过 $n$），空间 $O(n^2)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*
import std.sort.*

main() {
    let MOD: Int64 = 1000000007
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let nn = n
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    // 将 B 按 a 升序排序
    sort(a)
    // 阶乘
    let fact = Array<Int64>(nn + 1, { _ => 0 })
    fact[0] = 1
    for (i in 1..nn + 1) {
        fact[i] = fact[i - 1] * Int64(i) % MOD
    }
    // g[k][z]：从排序后 B_{k+1..n} 中选 z 个点匹配到 A_{a_k+1..n} 的方案数（0 基下标，g[k] 即题解 g[k]）
    let g = Array<Array<UInt32>>(nn + 1, { _ => Array<UInt32>(nn + 1, { _ => 0 }) })
    g[nn][0] = 1
    var k: Int64 = nn
    while (k >= 2) {
        let L = a[k - 1] - a[k - 2]   // k 减小时集合 2 新增的 A 空位数
        let M = nn - k + 1            // 集合 4（B_k..B_n）的大小
        var cur = g[k]
        var step: Int64 = 0
        while (step < L) {
            let nxt = Array<UInt32>(nn + 1, { _ => 0 })
            nxt[0] = cur[0]
            for (z in 1..nn + 1) {
                let rest = M - z + 1  // 新空位被使用时可选用的未匹配 B 点数
                var v: Int64 = Int64(cur[z])
                if (rest > 0) {
                    v += Int64(cur[z - 1]) * rest
                }
                nxt[z] = UInt32(v % MOD)
            }
            cur = nxt
            step += 1
        }
        g[k - 1] = cur
        k -= 1
    }
    // 枚举 k：排序后编号最大（a 最大）的未匹配 B 点；f 逐行维护 f[k-1]
    var ans: Int64 = 0
    var fprev = Array<UInt32>(nn + 1, { _ => 0 })
    fprev[0] = 1
    for (k in 1..nn + 1) {
        let ak = a[k - 1]
        // x：集合 1（A_1..A_{a_k}）与集合 3（B_1..B_{k-1}）之间的边数
        var lo: Int64 = ak + k - nn
        if (lo < 0) {
            lo = 0
        }
        var hi: Int64 = k - 1
        if (hi > ak) {
            hi = ak
        }
        var x: Int64 = lo
        while (x <= hi) {
            let z = nn - k - ak + x  // 集合 4 中剩余需要与集合 2 匹配的点数
            let ways = Int64(fprev[x]) * Int64(g[k][z]) % MOD * fact[Int64(ak - x)] % MOD
            ans = (ans + ways) % MOD
            x += 1
        }
        // 更新 f 到 f[k]：B_1..B_k 中恰好匹配 j 个 A 点的方案数
        let fnext = Array<UInt32>(nn + 1, { _ => 0 })
        fnext[0] = 1
        var jmax: Int64 = k
        if (jmax > ak) {
            jmax = ak
        }
        for (j in 1..jmax + 1) {
            let v = Int64(fprev[j]) + Int64(fprev[j - 1]) * (ak - j + 1)
            fnext[j] = UInt32(v % MOD)
        }
        fprev = fnext
    }
    // 所有 B 点都匹配的完美匹配
    ans = (ans + Int64(fprev[nn])) % MOD
    println(ans)
}
```

</details>

要点：

- $x$ 的下界为 $\max(0,\ a_k + k - n)$，保证 $z = (n-k) - (a_k - x) \ge 0$；$x$ 的上界为 $\min(k-1,\ a_k)$。
- $f$ 只需逐行维护：枚举 $k$ 时恰好用到 $f_{k-1}$ 整行，配合 $g_k$ 计算贡献后再推进一行。
- $g$ 数组全部预先算好（$k$ 从大到小），因为枚举 $k$ 时每个 $g_k$ 都要用到。
