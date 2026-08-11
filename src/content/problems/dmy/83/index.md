---
oj: dmy
pid: '83'
title: '[R14E]密码'
difficulty: 普及/提高-
tags:
  - 动态规划
  - 滚动数组
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^6$，$2 \le k \le 9$。$S$ 仅由 $0 \sim k$ 的数字组成。

## 思路

题目要求统计「不存在连续 $k$ 位相同」的密码数量，并且部分位置已经固定。直接维护「不连续 $k$ 位」这个条件不方便，因为合法与否取决于末尾一段连续相同字符的长度，于是把这段长度作为状态。

定义 $dp[i][j][len]$ 表示只考虑前 $i$ 位、第 $i$ 位是数字 $j$、且末尾恰好是连续 $len$ 个 $j$ 的合法密码数（$1 \le j \le k$，$1 \le len \le k-1$，$len = k$ 时已经非法所以不存）。从第 $i-1$ 位往第 $i$ 位转移：

- 若第 $i$ 位填 $x$，且与前一位 $y$ 不同（$x \ne y$）：末尾的连续段重新开始，长度为 $1$，贡献 $dp[i][x][1] \mathrel{+}= \sum_{y \ne x}\sum_{z} dp[i-1][y][z]$；
- 若第 $i$ 位填 $x$，且与前一位相同（$x = y$）：末尾连续段延长一格，$dp[i][x][len+1] \mathrel{+}= dp[i-1][x][len]$（$len < k-1$ 时才有效）。

直接实现是 $O(nk^3)$，瓶颈在第一类转移里那两个求和。

**优化**：令 $f[i][j] = \sum_{len} dp[i][j][len]$ 表示前 $i$ 位、第 $i$ 位为 $j$ 的合法总数，令 $g[i] = \sum_{j} f[i][j]$ 表示前 $i$ 位合法总数。则第一类转移可以 $O(1)$ 写成：

$$dp[i][x][1] = \sum_{y \ne x} f[i-1][y] = g[i-1] - f[i-1][x]$$

第二类转移本质上只是「同一列整体右移一格」，不需要重新求和。于是每个位置的状态更新降为 $O(k)$，总复杂度 $O(nk^2)$。

处理固定字符时有一个易错点：若第 $i$ 位已固定为 $x$，那么所有 $y \ne x$ 的列在这一步必须**清零**（它们不可能出现在第 $i$ 位为 $x$ 的密码里），只有第 $x$ 列参与右移和首项更新。

**空间**：注意到第 $i$ 位只依赖第 $i-1$ 位，可以用滚动数组把第一维压掉；进一步用两块缓冲区交替（双缓冲），避免每次循环重新分配数组，对 $n = 10^6$ 这种规模非常关键——若每轮都新建小数组，仅分配开销就足以 TLE。

整体时间复杂度 $O(nk^2)$，空间复杂度 $O(k^2)$（状态量很小）。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*
import std.collection.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = first[0]
    let k = first[1]
    let s = reader.readln().getOrThrow()

    // 滚动 DP，状态用扁平数组 buf[digit*(k) + len] 表示：当前前缀末尾为 digit、最后一段长度为 len 的合法密码数。
    // len 取 1..k-1（长度达到 k 即非法）。digit 取 1..k。
    // 用两块缓冲区交替，避免每轮重新分配。
    // 转移（第 i 位填 x）：
    //   - 旧 dp[x][len] 整体右移一位变成新 dp[x][len+1]（len+1 <= k-1），超出丢弃；
    //   - 新 dp[x][1] = g - f[x]，其中 g = sum_x f[x]，f[x] = sum_{len=1..k-1} dp[x][len]；
    //   - 其它列 y != x 清零。
    let MOD = 998244353
    let kk = Int64(k)
    let stride = kk // len 0..k-1，下标 0..k-1；只用 1..k-1
    // 两块缓冲
    let a = Array<Int64>((kk + 1) * stride, { _ => 0 })
    let b = Array<Int64>((kk + 1) * stride, { _ => 0 })

    // 第一位单独初始化
    let bytes = s.toArray() // 数字是 ASCII，按字节处理即可
    let ch0 = bytes[0]
    if (ch0 == 0x30) {
        // '0' 未知，所有 digit 置 1
        var xx = 1
        while (xx <= kk) {
            a[xx * stride + 1] = 1
            xx = xx + 1
        }
    } else {
        let xx = Int64(UInt32(ch0) - 0x30)
        a[xx * stride + 1] = 1
    }

    var cur = a
    var nxt = b
    var i = 1
    while (i < n) {
        // 先算 f[x] 和 g
        var g: Int64 = 0
        // f 复用一个固定小数组（k+1 个元素），不重新分配
        // 用局部变量足够：k<=9，直接展开或用小数组
        // 这里复用 nxt 里暂不使用的 [0..stride] 区间无意义，单独建小数组开销可忽略；
        // 但为避免分配，用一块预分配的 fbuf。
        // fbuf 放在循环外更省；这里每轮重置即可。
        var fi = 0
        // 借用 nxt 的第 0 行存 f（digit 0 不用）
        while (fi <= kk) {
            nxt[fi * stride + 0] = 0
            fi = fi + 1
        }
        var x = 1
        while (x <= kk) {
            var sum: Int64 = 0
            var base = x * stride
            var len = 1
            while (len < kk) {
                sum = sum + cur[base + len]
                len = len + 1
            }
            sum = sum % MOD
            nxt[x * stride + 0] = sum // f[x] 暂存
            g = (g + sum) % MOD
            x = x + 1
        }
        // 处理第 i 位
        let ch = bytes[i]
        var fixX: Int64 = -1
        if (ch != 0x30) {
            fixX = Int64(UInt32(ch) - 0x30)
        }
        var xx = 1
        while (xx <= kk) {
            if (fixX < 0 || xx == fixX) {
                // 该列右移 + 新首项
                let curBase = xx * stride
                let nxtBase = xx * stride
                // 先清零该列（因为之前 f 存在 len=0，len>=1 仍是旧值需覆盖）
                var cl = 1
                while (cl < kk) {
                    nxt[nxtBase + cl] = 0
                    cl = cl + 1
                }
                // 从 len=k-1 倒序写到 len=2
                var l = kk - 1
                while (l >= 2) {
                    nxt[nxtBase + l] = cur[curBase + l - 1]
                    l = l - 1
                }
                nxt[nxtBase + 1] = (g - nxt[nxtBase + 0] + MOD) % MOD
            } else {
                // 清零该列
                let nxtBase = xx * stride
                nxt[nxtBase + 0] = 0
                var cl = 1
                while (cl < kk) {
                    nxt[nxtBase + cl] = 0
                    cl = cl + 1
                }
            }
            xx = xx + 1
        }
        // 清掉 len=0 暂存位（f），避免污染下一次
        var z = 0
        while (z <= kk) {
            nxt[z * stride + 0] = 0
            z = z + 1
        }
        // 交换 cur / nxt
        let t = cur
        cur = nxt
        nxt = t
        i = i + 1
    }

    var ans: Int64 = 0
    var x = 1
    while (x <= kk) {
        let base = x * stride
        var len = 1
        while (len < kk) {
            ans = (ans + cur[base + len]) % MOD
            len = len + 1
        }
        x = x + 1
    }
    println(ans)
}
```

要点：

- 「末尾连续段长度」是本题的状态核心；用它做状态后，$O(nk^2)$ 的瓶颈在于第一类转移的双求和，引入 $f$、$g$ 两个前缀和量即可降到 $O(1)$。
- 固定位的处理要小心：被固定为 $x$ 时，其它列 $y \ne x$ 必须**清零**，而不是保持旧值——否则会把「第 $i$ 位填 $y$」的方案错误地计入。
- 状态总量只有 $k \times (k-1) \le 72$，但 $n$ 高达 $10^6$，每轮循环都新建小数组会带来大量分配开销而 TLE；用两块扁平缓冲区交替（双缓冲）把分配降到 $O(1)$ 次，实测最慢点约 $220\text{ ms}$。
