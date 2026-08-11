---
oj: dmy
pid: '377'
title: '[R60E] 折叠'
difficulty: 普及/提高-
tags:
  - 区间 DP
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 100$，$a_i \in \{0,1\}$。

## 思路

任意时刻，当前纸条上的折痕方向序列都是原序列的某个连续区间，或者是该区间整体取反（折叠后保留的一侧恰好是原序列的一段；当左侧更长时，保留的左侧会整体取反）。

合法折叠只要求对称位置方向互异（$b_{x-i}\ne b_{x+i}$），序列整体取反不会改变这个条件。因此 DP 时无需记录是否取反，只需要知道当前剩余的是原序列中的哪个区间。

定义 $dp[l][r]$ 表示把原序列区间 $[l,r]$ 对应的纸条折成空所需的最少操作次数，初始 $dp[i][i]=1$（一条折痕，折一次即为空）。

对非空区间 $[l,r]$，枚举本次折叠的折痕位置 $k$（$l\le k\le r$），记左侧折痕数 $L=k-l$、右侧折痕数 $R=r-k$。折叠合法当且仅当

$$a_{k-d}\ne a_{k+d},\quad 1\le d\le\min(L,R)$$

即从折痕向两侧展开时，对称位置方向必须互异。暴力检查即可。若合法，分两种情况转移：

- $L\le R$：折叠后保留右侧区间 $[k+1,r]$，则 $dp[l][r]=\min(dp[l][r],1+dp[k+1][r])$；
- $L>R$：折叠后保留左侧区间 $[l,k-1]$（方向整体取反，不影响后续），则 $dp[l][r]=\min(dp[l][r],1+dp[l][k-1])$。

按区间长度从小到大计算，最终答案为 $dp[1][n]$。

时间复杂度 $O(n^4)$（区间数 $O(n^2)$，枚举折痕 $O(n)$，合法性检查 $O(n)$），空间复杂度 $O(n^2)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let nn = n
    let inf: Int64 = 1000000000
    let dp = Array<Array<Int64>>(nn, { _ => Array<Int64>(nn, { _ => inf }) })
    // 长度为 1 的区间：一条折痕，折一次即为空
    for (i in 0..nn) {
        dp[i][i] = 1
    }
    var len = 2
    while (len <= nn) {
        for (l in 0..(nn - len + 1)) {
            let r = l + len - 1
            var best = inf
            var k = l
            while (k <= r) {
                let L = k - l
                let R = r - k
                // 检查折叠点 k 是否合法：两侧对称位置方向互异
                var ok = true
                var d = 1
                var mn = L
                if (R < L) {
                    mn = R
                }
                while (d <= mn) {
                    if (a[k - d] == a[k + d]) {
                        ok = false
                        break
                    }
                    d = d + 1
                }
                if (ok) {
                    var cand: Int64 = inf
                    if (L <= R) {
                        // 保留右侧 [k+1, r]
                        if (k + 1 <= r) {
                            cand = 1 + dp[k + 1][r]
                        } else {
                            cand = 1
                        }
                    } else {
                        // 保留左侧 [l, k-1]（取反不影响合法性，无需记录）
                        cand = 1 + dp[l][k - 1]
                    }
                    if (cand < best) {
                        best = cand
                    }
                }
                k = k + 1
            }
            dp[l][r] = best
        }
        len = len + 1
    }
    println(dp[0][nn - 1])
}
```

## 要点

- **取反不敏感**：整体取反不改变对称位置互异的判定，DP 状态只需记录区间 $[l,r]$，省去一维「是否取反」。
- **转移方向**：折叠后保留的那一侧区间长度严格小于当前区间，按区间长度从小到大计算即可保证子状态已求出。
- $n\le100$，$O(n^4)$ 的暴力合法性检查完全可行，无需预处理。
