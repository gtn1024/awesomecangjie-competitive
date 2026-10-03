---
oj: dmy
pid: '48'
title: '[R8F] 括号子序列'
difficulty: 提高
tags:
  - 动态规划
  - 计数
  - 括号匹配
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 500$，$S$ 仅含 `(`、`)`、`?`。

## 思路

合法括号序列的判定可以贪心扫描：维护尚未配对的左括号数（溢出）。`(` 让溢出 $+1$；`)` 在溢出 $>0$ 时让溢出 $-1$，否则非法。本题里 `?` 可以当 `(` 也可以当 `)`，且首尾可以借助 `?` 拼接成配对，于是需要更细的状态。

把尚未配对的 `(` 或 `?` 的数量称为 **溢出** $j$，把已经用 `(?`、`??` 配成的对数称为 **备用** $k$。备用对可以拆成两个溢出来「救」一个在溢出为 $0$ 时遇到的 `)`。贪心配对规则：

- `(`：溢出 $+1$；
- `?`：溢出为 $0$ 时当 `(`，溢出 $+1$；否则当 `)` 与一个溢出配对，溢出 $-1$、备用 $+1$；
- `)`：溢出 $>0$ 时溢出 $-1$；溢出为 $0$ 但备用 $>0$ 时，把一对备用拆成两个溢出再配对，净效果溢出 $+1$、备用 $-1$。

设 $dp[j][k]$ 表示当前前缀中、各子序列经过上述贪心配对后处于（溢出 $j$，备用 $k$）的方案数。初始 $dp[0][0]=1$（空子序列）。逐字符滚动：先「删除该字符」——状态全部不变；再「保留该字符」——按上面的规则做转移，两份方案数相加。最后答案是所有 $dp[0][k]$ 之和（溢出归零即合法）。过程中对 $998244353$ 取模。

复杂度：时间 $O(n^3)$，空间 $O(n^2)$（滚动数组）。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

let MOD: Int64 = 998244353

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow()
    let arr = s.toRuneArray()
    let N = n + 1
    var dp = Array<Array<Int64>>(N, { _ => Array<Int64>(N, { _ => 0 }) })
    dp[0][0] = 1
    for (idx in 0..n) {
        let ch = arr[idx]
        var ndp = Array<Array<Int64>>(N, { _ => Array<Int64>(N, { _ => 0 }) })
        // 删除：先把 dp 原样复制
        for (j in 0..=idx) {
            let dpr = dp[j]
            let ndpr = ndp[j]
            for (k in 0..=(idx - j)) {
                ndpr[k] = dpr[k]
            }
        }
        // 保留：按字符类型转移
        if (ch == r'(') {
            for (j in 0..=idx) {
                for (k in 0..=(idx - j)) {
                    let v = dp[j][k]
                    if (v != 0) {
                        let nj = j + 1
                        ndp[nj][k] = (ndp[nj][k] + v) % MOD
                    }
                }
            }
        } else if (ch == r')') {
            for (j in 0..=idx) {
                for (k in 0..=(idx - j)) {
                    let v = dp[j][k]
                    if (v != 0) {
                        if (j > 0) {
                            ndp[j - 1][k] = (ndp[j - 1][k] + v) % MOD
                        } else if (k > 0) {
                            ndp[j + 1][k - 1] = (ndp[j + 1][k - 1] + v) % MOD
                        }
                    }
                }
            }
        } else {
            for (j in 0..=idx) {
                for (k in 0..=(idx - j)) {
                    let v = dp[j][k]
                    if (v != 0) {
                        if (j == 0) {
                            ndp[j + 1][k] = (ndp[j + 1][k] + v) % MOD
                        } else {
                            ndp[j - 1][k + 1] = (ndp[j - 1][k + 1] + v) % MOD
                        }
                    }
                }
            }
        }
        dp = ndp
    }
    var ans: Int64 = 0
    let d0 = dp[0]
    for (k in 0..=n) {
        ans = (ans + d0[k]) % MOD
    }
    println(ans)
}
```

</details>

要点：

- 引入「备用对」状态是把含 `?` 的括号匹配贪心化的关键：它表示当前可以随时拆出来救场的已配对 `(?` / `??`。
- 「删除 / 保留」两择相加，自然地枚举了所有子序列而不重不漏。
