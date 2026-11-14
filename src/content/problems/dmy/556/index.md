---
oj: dmy
pid: '556'
title: '字符串袋子'
difficulty: 普及+
tags:
  - 线性 DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le |T| \le 100$，$1 \le N \le 100$，$1 \le A_i \le 10$，$1 \le |S_{i,j}| \le 10$，所有字符串只含小写英文字母。

## 思路

**状态。** 由于 $S$ 始终是 $T$ 的一个前缀（任何时刻若 $S$ 不是 $T$ 的前缀，后面再接字符串也永远拼不回 $T$），所以只需记录 $S$ 已经匹配了多少位。设 $dp[k]$ 表示处理完当前这批袋子后，$S$ 恰为 $T$ 的前 $k$ 位时的最少费用。初值 $dp[0]=0$，其余为正无穷（不可达）。

**转移。** 逐个袋子更新。对第 $i$ 个袋子，有两种选择：

- 跳过：$dp$ 原样保留；
- 选其中某个串 $s$：只有当 $dp[k]$ 可达、$k+|s|\le |T|$ 且 $T$ 的第 $k$ 位起与 $s$ 完全相同（即 $T[k,k+|s|)=s$）时，才能从 $k$ 走到 $k+|s|$，费用加 $1$。

**为什么必须用两个数组。** 一个袋子最多只能选一个串，因此同一轮内的所有转移都只能从**处理该袋之前**的 $dp$ 出发，不能读到本轮刚更新的值。实现上先令 `new` 复制一份 $dp$（对应「跳过」），再用旧的 $dp$ 去更新 `new`；一轮结束把 `new` 赋回 $dp$。若只用一个数组就地进行，就等于允许同一个袋子里连选多个串，会把答案算小。

**边界。** 长度超出 $|T|$ 的转移直接忽略；比较前先判 $k+|s|\le |T|$，避免越界切片。全部袋子处理完后，$dp[|T|]$ 仍为无穷即说明无法拼出 $T$，输出 $-1$。

## 复杂度

时间复杂度 $O(N\cdot A_i \cdot |T| \cdot L)$，其中 $L\le 10$ 为串长（字符串比较的开销），代入数据上限约为 $100\times 10\times 100\times 10$；空间复杂度 $O(|T|)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let t = reader.readln().getOrThrow()
    let n = Int64.parse(reader.readln().getOrThrow())
    let m = t.size
    let INF: Int64 = 1000000000000
    var dp = Array<Int64>(m + 1, { _ => INF })
    dp[0] = 0
    for (_ in 0..n) {
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let a = Int64.parse(parts[0])
        let nd = Array<Int64>(m + 1, { _ => INF })
        for (j in 0..=m) {
            nd[j] = dp[j]
        }
        for (k in 1..=a) {
            let s = parts[k]
            let ls = s.size
            for (len in 0..=m) {
                if (dp[len] < INF && len + ls <= m) {
                    if (t[len..(len + ls)] == s) {
                        let ni = len + ls
                        if (dp[len] + 1 < nd[ni]) {
                            nd[ni] = dp[len] + 1
                        }
                    }
                }
            }
        }
        dp = nd
    }
    if (dp[m] >= INF) {
        println(-1)
    } else {
        println(dp[m])
    }
}
```

</details>
