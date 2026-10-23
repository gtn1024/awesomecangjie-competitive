---
oj: dmy
pid: '522'
title: '[R81D] 货物'
difficulty: 普及+/提高
tags:
  - 双指针
  - 计数
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le m \le n \le 2\times 10^5$，$1 \le c_i \le m$。

## 思路

**取法的形状。** 每次只能在当前剩余货物里取最左或最右的一件，取 $m$ 次后，从左边共取走 $l$ 件、从右边共取走 $m-l$ 件。左边取走的必然是原序列的前缀 $1..l$，右边取走的必然是后缀 $n-(m-l)+1..n$，中间是否交替取并不影响最终的编号集合。反过来，任意 $l\in[0,m]$ 都可以先取 $l$ 次左边、再取 $m-l$ 次右边实现，因此 **所有可能的取法恰好是这 $m+1$ 种「前缀 $l$ 与后缀 $m-l$ 的并」**。

**合法的判定。** 一共取走 $m$ 件货物，而颜色恰好只有 $m$ 种，所以「每种颜色恰好出现一次」等价于 **取走的 $m$ 件货物颜色两两不同**，也就是这 $m$ 件里没有重复颜色。

**$m<n$ 的情形。** 此时同一 $l$ 的前缀与后缀互不重叠。不同的 $l$ 也给出不同的下标集合：设 $l_1<l_2$，位置 $n-m+l_2$ 属于 $l_1$ 的后缀（$l_1$ 的后缀起点更靠左），却被 $l_2$ 的后缀起点挡在外面；它也不属于 $l_2$ 的前缀，因为 $n>m$ 时 $n-m+l_2>l_2$。于是答案就是满足条件的 $l$ 的 **个数**，不需要去重。

下标（从 $1$ 开始编号）随 $l$ 从 $0$ 递增到 $m$ 只移动两个位置：

- 由 $l$ 变到 $l+1$ 时，前缀多出位置 $l+1$；
- 同时后缀少掉位置 $n-m+l+1$。

因此用一个长度为 $m+1$ 的颜色计数数组 $\textit{cnt}$ 和「当前出现次数不少于 $2$ 的颜色个数」$\textit{dup}$ 就能维护重复情况：加入时若计数从 $1$ 变成 $2$ 则 $\textit{dup}$ 加 $1$，移出时若计数从 $2$ 变成 $1$ 则 $\textit{dup}$ 减 $1$。初始窗口取 $l=0$ 对应的后缀 $n-m+1..n$。每个 $l$ 在转移前检查，$\textit{dup}=0$ 就计入答案。

**注意** $\textit{dup}$ 只在计数跨过 $2$ 时变化，写成「计数 $\ge 1$ 就加一」会把出现三次及以上的颜色重复计数，导致后续窗口的重复数被高估。

**$m=n$ 的情形。** 前缀与后缀拼起来始终是整个序列，$l$ 取任何值得到的都是全集 $\{1,\dots,n\}$，按题意它们是同一种取法。因此答案只能是 $1$（全部颜色互不相同）或 $0$。

## 复杂度

扫描一遍序列并滑动 $m+1$ 个窗口，时间 $O(n+m)$；颜色计数数组空间 $O(m)$，存储输入序列空间 $O(n)$。

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
    let c = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let cnt = Array<Int64>(m + 1, { _ => 0 })
    var dup: Int64 = 0
    var ans: Int64 = 0
    if (m == n) {
        for (i in 0..n) {
            let x = c[i]
            cnt[x] += 1
            if (cnt[x] == 2) {
                dup += 1
            }
        }
        if (dup == 0) {
            ans = 1
        }
        println(ans)
    } else {
        for (i in (n - m)..n) {
            let x = c[i]
            cnt[x] += 1
            if (cnt[x] == 2) {
                dup += 1
            }
        }
        for (l in 0..=m) {
            if (dup == 0) {
                ans += 1
            }
            if (l < m) {
                let a = c[l]
                cnt[a] += 1
                if (cnt[a] == 2) {
                    dup += 1
                }
                let b = c[n - m + l]
                cnt[b] -= 1
                if (cnt[b] == 1) {
                    dup -= 1
                }
            }
        }
        println(ans)
    }
}
```

</details>
