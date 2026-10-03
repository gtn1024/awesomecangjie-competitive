---
oj: dmy
pid: '480'
title: '[R77F] 巡检'
difficulty: 提高+
tags:
  - 分治
  - 双指针
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，$p$ 是 $1,2,\dots,n$ 的排列。

## 思路

先明确要统计的对象：对区间 $[l,r]$，设 $p$ 在该区间内最小值的位置为 $u$、最大值的位置为 $v$，要求 $u+v=l+r$。由于 $p$ 是排列，区间内最值的位置唯一。

直接枚举所有区间并顺便维护最值位置是 $O(n^2)$，只能通过 $n\le 3000$ 的子任务。改用分治：对区间 $[L,R]$ 取中点 $M=\lfloor (L+R)/2\rfloor$，先递归统计完全落在 $[L,M]$ 与 $[M+1,R]$ 内的区间，再统计跨中点区间，即 $l\le M<r$ 的区间。长度为 $1$ 的区间总是合法（$u=v=l=r$），作为递归边界直接返回 $1$。

跨中点的区间被中点切成左段 $[l,M]$ 与右段 $[M+1,r]$。预处理左段后缀最值：对每个 $l\le M$ 记

$$mn_L(l)=\min_{l\le i\le M}p_i,\qquad mx_L(l)=\max_{l\le i\le M}p_i,$$

以及取到最值的位置 $posmn_L(l)$、$posmx_L(l)$；右段前缀同理，对每个 $r>M$ 记 $mn_R(r)$、$mx_R(r)$、$posmn_R(r)$、$posmx_R(r)$。这两组量都能从 $M$ 与 $M+1$ 出发向外递推，$O(R-L+1)$ 求出。

整个区间的最值必然来自左段或右段，按来源分成四种互不重叠的情况。

### 情况一：最值都在左段

此时整个区间的最小值就是 $mn_L(l)$，位置 $u=posmn_L(l)$；最大值就是 $mx_L(l)$，位置 $v=posmx_L(l)$。两个位置都只与 $l$ 有关，对称条件 $u+v=l+r$ 直接解出

$$r=posmn_L(l)+posmx_L(l)-l,$$

也就是说每个 $l$ 至多产生一个候选 $r$。只需再校验两件事：

- $M<r\le R$，保证区间确实跨越中点；
- 加入右段后最值没有被右段抢走，即 $mn_R(r)>mn_L(l)$ 且 $mx_R(r)<mx_L(l)$。

枚举所有左端点即可完整统计本情况。

### 情况二：最值都在右段

与情况一完全对称：枚举右端点 $r$，取 $u=posmn_R(r)$、$v=posmx_R(r)$，则候选左端点唯一，为

$$l=posmn_R(r)+posmx_R(r)-r.$$

校验 $L\le l\le M$、$mn_L(l)>mn_R(r)$、$mx_L(l)<mx_R(r)$ 即可。

### 情况三：最小值在左段，最大值在右段

此时整个区间的最值分别取自两段，要求

$$mn_L(l)<mn_R(r),\qquad mx_L(l)<mx_R(r).$$

而对称条件写作 $posmn_L(l)+posmx_R(r)=l+r$，即

$$posmn_L(l)-l=r-posmx_R(r).$$

固定 $l$ 观察 $r$ 的合法范围。当 $r$ 增大时，$mn_R(r)$ 不增，所以 $mn_R(r)>mn_L(l)$ 是一段前缀 $r\le hi$；$mx_R(r)$ 不减，所以 $mx_R(r)>mx_L(l)$ 是一段后缀 $r\ge lo$。两者之交仍是连续的一段 $[lo(l),hi(l)]$（可能为空）。

于是本情况的贡献为：$r\in[lo(l),hi(l)]$ 中满足 $r-posmx_R(r)=posmn_L(l)-l$ 的个数。

当 $l$ 从 $M$ 向左移动时，$mn_L(l)$ 不增、$mx_L(l)$ 不减，两个条件都越来越容易满足，因此 $lo(l)$ 与 $hi(l)$ 都只会向右移动。用双指针维护窗口 $[lo,hi]$：$hi$ 右移时把 $r-posmx_R(r)$ 放进计数桶，$lo$ 右移时从桶中扣除，当前 $l$ 的贡献就是 $cnt[posmn_L(l)-l]$。

### 情况四：最大值在左段，最小值在右段

同样是对称的：要求

$$mx_L(l)<mx_R(r),\qquad mn_L(l)>mn_R(r),$$

对称条件写成 $posmx_L(l)+posmn_R(r)=l+r$，即

$$posmx_L(l)-l=r-posmn_R(r).$$

$mx_R(r)<mx_L(l)$ 仍限制出一段前缀，$mn_R(r)<mn_L(l)$ 限制出一段后缀，合法范围还是 $[lo(l),hi(l)]$；$l$ 向左移动时两个界同样单调右移。把桶中记录的值换成 $r-posmn_R(r)$，答案累加 $cnt[posmx_L(l)-l]$ 即可。

### 实现细节

四个量 $posmn_L(l)-l$、$posmx_L(l)-l$、$r-posmx_R(r)$、$r-posmn_R(r)$ 都落在 $[0,n-1]$ 内，用一个长为 $n+1$ 的数组当计数桶即可。每统计完一种情况，把窗口里的元素逐个从桶中撤销，保证进入下一层递归时桶是空的。

## 复杂度

每层的预处理与四种情况的统计都是 $O(len)$：双指针在每个递归层内单调移动，均摊线性。递归共 $O(\log n)$ 层，故时间复杂度 $O(n\log n)$；递归深度 $O(\log n)$，辅助数组与计数桶共 $O(n)$ 空间。

答案最大为 $n(n+1)/2\approx 2\times 10^{10}$，需要用 `Int64` 存放。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

var n: Int64 = 0
var p = Array<Int64>(1, { _ => 0 })
var mnL = Array<Int64>(1, { _ => 0 })
var mxL = Array<Int64>(1, { _ => 0 })
var pmnL = Array<Int64>(1, { _ => 0 })
var pmxL = Array<Int64>(1, { _ => 0 })
var mnR = Array<Int64>(1, { _ => 0 })
var mxR = Array<Int64>(1, { _ => 0 })
var pmnR = Array<Int64>(1, { _ => 0 })
var pmxR = Array<Int64>(1, { _ => 0 })
var cnt = Array<Int64>(1, { _ => 0 })

func count(L: Int64, R: Int64): Int64 {
    if (L > R) {
        return 0
    }
    if (L == R) {
        return 1
    }
    let M = (L + R) / 2
    var ans = count(L, M) + count(M + 1, R)

    var mn = p[M]
    var mx = p[M]
    var pmn = M
    var pmx = M
    var i = M
    while (i >= L) {
        let v = p[i]
        if (v < mn) {
            mn = v
            pmn = i
        }
        if (v > mx) {
            mx = v
            pmx = i
        }
        mnL[i] = mn
        mxL[i] = mx
        pmnL[i] = pmn
        pmxL[i] = pmx
        i -= 1
    }

    mn = p[M + 1]
    mx = p[M + 1]
    pmn = M + 1
    pmx = M + 1
    var j = M + 1
    while (j <= R) {
        let v = p[j]
        if (v < mn) {
            mn = v
            pmn = j
        }
        if (v > mx) {
            mx = v
            pmx = j
        }
        mnR[j] = mn
        mxR[j] = mx
        pmnR[j] = pmn
        pmxR[j] = pmx
        j += 1
    }

    var l = M
    while (l >= L) {
        let r = pmnL[l] + pmxL[l] - l
        if (r > M && r <= R) {
            if (mnR[r] > mnL[l] && mxR[r] < mxL[l]) {
                ans += 1
            }
        }
        l -= 1
    }

    var r = M + 1
    while (r <= R) {
        let w = pmnR[r] + pmxR[r] - r
        if (w >= L && w <= M) {
            if (mnL[w] > mnR[r] && mxL[w] < mxR[r]) {
                ans += 1
            }
        }
        r += 1
    }

    var lo = M + 1
    var hi = M
    l = M
    while (l >= L) {
        while (hi < R && mnR[hi + 1] > mnL[l]) {
            hi += 1
            cnt[hi - pmxR[hi]] += 1
        }
        while (lo <= hi && mxR[lo] <= mxL[l]) {
            cnt[lo - pmxR[lo]] -= 1
            lo += 1
        }
        ans += cnt[pmnL[l] - l]
        l -= 1
    }
    while (lo <= hi) {
        cnt[lo - pmxR[lo]] -= 1
        lo += 1
    }

    lo = M + 1
    hi = M
    l = M
    while (l >= L) {
        while (hi < R && mxR[hi + 1] < mxL[l]) {
            hi += 1
            cnt[hi - pmnR[hi]] += 1
        }
        while (lo <= hi && mnR[lo] >= mnL[l]) {
            cnt[lo - pmnR[lo]] -= 1
            lo += 1
        }
        ans += cnt[pmxL[l] - l]
        l -= 1
    }
    while (lo <= hi) {
        cnt[lo - pmnR[lo]] -= 1
        lo += 1
    }

    return ans
}

main() {
    let reader = getStdIn()
    n = Int64.parse(reader.readln().getOrThrow())
    p = Array<Int64>(n + 1, { _ => 0 })
    mnL = Array<Int64>(n + 1, { _ => 0 })
    mxL = Array<Int64>(n + 1, { _ => 0 })
    pmnL = Array<Int64>(n + 1, { _ => 0 })
    pmxL = Array<Int64>(n + 1, { _ => 0 })
    mnR = Array<Int64>(n + 1, { _ => 0 })
    mxR = Array<Int64>(n + 1, { _ => 0 })
    pmnR = Array<Int64>(n + 1, { _ => 0 })
    pmxR = Array<Int64>(n + 1, { _ => 0 })
    cnt = Array<Int64>(n + 1, { _ => 0 })
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ s: String => Int64.parse(s) })
    var i = 0
    while (i < n) {
        p[i + 1] = a[i]
        i += 1
    }
    println(count(1, n))
}
```

</details>
