---
oj: dmy
pid: '553'
title: '序列分段'
difficulty: 提高
tags:
  - 单调队列优化 DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le n \le 10^5$，$0 \le s \le 10^9$，$1 \le l \le 10^5$，$-10^9 \le a_i \le 10^9$。

## 思路

记 $dp[i]$ 为把前 $i$ 个元素划分完所需的最少段数，$dp[0]=0$，其余初值视为不可达。枚举最后一段 $[j+1,i]$：

$$dp[i] = 1 + \min\{\,dp[j] \;:\; j \le i-l,\ \max a_{j+1..i} - \min a_{j+1..i} \le s\,\}.$$

**合法起点构成后缀。** 固定右端 $i$，若 $[x,i]$ 的极差不超过 $s$，那么起点更靠右的 $[x',i]$（$x' \ge x$）只是少几个元素，极差只会更小。因此对每个 $i$ 存在最小的合法起点 $L[i]$，且 $[j+1,i]$ 合法等价于 $j+1 \ge L[i]$，即 $j \ge L[i]-1$。转移于是化简为在区间上取最小值：

$$dp[i] = 1 + \min_{L[i]-1 \le j \le i-l} dp[j].$$

**用两个单调队列求 $L[i]$。** $i$ 增大时 $L[i]$ 单调不减（$[L[i],i]$ 合法蕴含 $[L[i],i-1]$ 合法），因此可以用双指针：维护当前窗口 $[p,i]$，其中 $p$ 是最小合法起点。窗口的最大值与最小值各用一个单调队列维护（队列存下标，队头即极值）。每加入 $a_i$ 后，若队头极值之差大于 $s$，就令 $p$ 右移一位，并把恰好等于旧 $p$ 的队头弹出，重复到极差满足条件为止，此时 $p$ 就是 $L[i]$。$p$ 在整个过程中只向右移动，总代价线性。

**再对 dp 套一个单调队列。** 随着 $i$ 增大，窗口 $[L[i]-1,\ i-l]$ 的左右端点都单调不减，这是标准的滑动窗口最小值。处理到 $i$ 时，先把新进入窗口的 $j=i-l$（$j \ge 0$ 时）插入队尾，插入前弹出所有 $dp$ 值不小于它的元素，保证队列内 $dp$ 单调递增；再把队头中所有小于 $L[i]-1$ 的下标弹出。此时队头就是窗口内 $dp$ 最小的下标，$dp[i]$ 取它加一。若队列为空，说明 $i$ 无法作为任何一段的右端，保持不可达。

**不可达的处理。** 不可达状态统一记为 $INF$，它的值加一后仍然不小于 $INF$，所以队头可能是不可达位置也不会污染「可达」的判定，最后只需检查 $dp[n] \ge INF$ 就输出 $-1$。

**边界。** 单独一个元素成段时极差为 $0 \le s$，所以 $L[i]$ 对每个 $i$ 都存在，$p$ 不会超过 $i$，第三层循环不会越界。$l > n$ 时没有任何合法分段，$dp[n]$ 一直不可达，自然输出 $-1$。

## 复杂度

时间 $O(n)$：三个单调队列的每个下标最多进出各一次，双指针的 $p$ 总共右移 $n$ 次。空间 $O(n)$，存放序列、$dp$ 与三个队列。

## 仓颉实现

三个队列都用定长数组加头尾指针手写，避免容器扩容开销；序列元素可能为负，快读里单独处理符号。

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
    var neg = false
    if (gpos < gdata.size && gdata[gpos] == 45) {
        neg = true
        gpos += 1
    }
    var x: Int64 = 0
    while (gpos < gdata.size && Int64(gdata[gpos]) > 32) {
        x = x * 10 + Int64(gdata[gpos]) - 48
        gpos += 1
    }
    if (neg) {
        return -x
    }
    return x
}

main() {
    gdata = getStdIn().readToEnd().getOrThrow().toArray()
    let n = nextInt()
    let s = nextInt()
    let l = nextInt()
    let a = Array<Int64>(n + 2, { _ => 0 })
    for (i in 1..=n) {
        a[i] = nextInt()
    }
    let INF: Int64 = 1 << 40
    let dp = Array<Int64>(n + 2, { _ => INF })
    dp[0] = 0
    let mxq = Array<Int64>(n + 2, { _ => 0 })
    let mnq = Array<Int64>(n + 2, { _ => 0 })
    let dq = Array<Int64>(n + 2, { _ => 0 })
    var mxh: Int64 = 0
    var mxt: Int64 = 0
    var mnh: Int64 = 0
    var mnt: Int64 = 0
    var dh: Int64 = 0
    var dt: Int64 = 0
    var p: Int64 = 1
    for (i in 1..=n) {
        while (mxt > mxh && a[mxq[mxt - 1]] <= a[i]) {
            mxt -= 1
        }
        mxq[mxt] = i
        mxt += 1
        while (mnt > mnh && a[mnq[mnt - 1]] >= a[i]) {
            mnt -= 1
        }
        mnq[mnt] = i
        mnt += 1
        while (a[mxq[mxh]] - a[mnq[mnh]] > s) {
            if (mxq[mxh] == p) {
                mxh += 1
            }
            if (mnq[mnh] == p) {
                mnh += 1
            }
            p += 1
        }
        let j = i - l
        if (j >= 0) {
            while (dt > dh && dp[dq[dt - 1]] >= dp[j]) {
                dt -= 1
            }
            dq[dt] = j
            dt += 1
        }
        while (dt > dh && dq[dh] < p - 1) {
            dh += 1
        }
        if (dt > dh) {
            dp[i] = dp[dq[dh]] + 1
        }
    }
    if (dp[n] >= INF) {
        println(-1)
    } else {
        println(dp[n])
    }
}
```

</details>
