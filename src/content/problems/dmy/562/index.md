---
oj: dmy
pid: '562'
title: '连锁反应'
difficulty: 提高
tags:
  - 线性 DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le n \le 10^5$，$0 \le a_i \le 10^6$，$1 \le b_i \le 10^6$，所有 $a_i$ 两两不同。

## 思路

**新信标只会摧毁一段后缀。** 新信标在所有原有信标右侧，它的爆炸范围是「位置不小于某个值」的一段，因此被它摧毁的原有信标恰好是按位置排序后的最右边连续 $k$ 个（$k$ 可以是 $0$ 到 $n$ 的任意值：把新信标放得足够远、半径取得足够小就能只摧毁前 $k$ 个）。剩下的信标是位置最靠左的 $n-k$ 个，之后蜗蜗从它们中间最靠右的那个开始，按位置从右到左激活，这个子过程与只考虑这 $n-k$ 个信标时完全相同。于是若记

- $S_j$：只考虑位置最靠左的 $j$ 个信标时，最终**没有**被摧毁的信标个数，

那么摧毁总数是 $k + \bigl((n-k) - S_{n-k}\bigr) = n - S_{n-k}$，对所有 $k$ 取最小即 $n-\max_j S_j$。

**关键观察：第一次爆炸之后，问题变成同一个问题的更小规模。** 只考虑最左边 $j$ 个信标时，最右侧的第 $j$ 个信标一定最先被激活、一定存活，它会摧毁左侧位置不小于 $a_j-b_j$ 的所有信标。这一刻还没有别的信标爆炸过，所以被摧毁的正是一段连续下标区间 $[L_j,\,j-1]$，其中 $L_j$ 是第一个位置满足 $a\ge a_j-b_j$ 的下标（所有位置都在这个区间内的信标都还活着）。区间左边的 $L_j-1$ 个信标一个都没受影响，并且在它们内部继续按位置从右到左激活——这正是「只考虑最左边 $L_j-1$ 个信标」的子问题。由此得到

$$S_j = 1 + S_{L_j-1},\qquad S_0 = 0 .$$

因为 $L_j \le j$，按 $j$ 从小到大递推即可，$O(n)$ 步。

**为什么不能简单认为新信标没用。** 摧毁最右侧的信标本身也计一次，但它的爆炸半径可能很大；把它连同半径一起「提前引爆」，反而能让左侧更多信标活下来。例如位置半径依次为 $(10,8),(13,2),(16,2),(19,11)$ 时，不用新信标会被 $19$ 那颗一次炸掉 $3$ 个，而让新信标只摧毁 $19$ 那颗后只剩 $1$ 个被摧毁。所以必须对所有前缀取最大值，不能只算 $j=n$。

**边界。** $L_j$ 落在第一个信标左边时取 $1$（等价于 $S_0$）；$k=n$ 对应把所有原有信标都摧毁，对应 $S_0=0$，因此答案一定不超过 $n$，$n=1$ 时为 $0$。

## 复杂度

位置范围只有 $10^6$，用位置桶代替排序，并在扫描时顺便记录「前缀桶里有几个信标」，于是 $L_j$ 可以 $O(1)$ 查出：时间 $O(n+A)$，空间 $O(n+A)$，其中 $A=10^6$ 是位置上界。若改用排序 + 二分，则为 $O(n\log n)$ 时间、$O(n)$ 空间。

## 仓颉实现

`pre[p]` 记录位置严格小于 `p` 的信标个数，它同时就是「$\ge p$ 的最左下标」，`a[i] - b[i]` 为负时截到 $0$（此时一个信标也不会被摧毁，对应 `S[0]`）。

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*

var gdata = Array<Byte>(0, { _ => 0 })
var gpos: Int64 = 0

func nextInt(): Int64 {
    while (gpos < gdata.size && Int64(gdata[gpos]) <= 32) {
        gpos += 1
    }
    var x: Int64 = 0
    while (gpos < gdata.size && Int64(gdata[gpos]) > 32) {
        x = x * 10 + Int64(gdata[gpos]) - 48
        gpos += 1
    }
    return x
}

main() {
    gdata = getStdIn().readToEnd().getOrThrow().toArray()
    let n = nextInt()
    let lim: Int64 = 1000001
    let rad = Array<Int64>(lim, { _ => 0 })
    let has = Array<Bool>(lim, { _ => false })
    for (_ in 0..n) {
        let x = nextInt()
        let y = nextInt()
        rad[x] = y
        has[x] = true
    }
    let a = Array<Int64>(n, { _ => 0 })
    let b = Array<Int64>(n, { _ => 0 })
    let pre = Array<Int64>(lim, { _ => 0 })
    var m: Int64 = 0
    for (p in 0..lim) {
        pre[p] = m
        if (has[p]) {
            a[m] = p
            b[m] = rad[p]
            m += 1
        }
    }
    let s = Array<Int64>(n + 1, { _ => 0 })
    var best: Int64 = 0
    for (i in 0..n) {
        let left = a[i] - b[i]
        var lo: Int64 = 0
        if (left >= 0) {
            lo = pre[left]
        }
        s[i + 1] = s[lo] + 1
        if (s[i + 1] > best) {
            best = s[i + 1]
        }
    }
    println(n - best)
}
```

</details>
