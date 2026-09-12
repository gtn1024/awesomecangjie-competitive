---
oj: dmy
pid: '407'
title: '[R65E] 运动的点'
difficulty: 普及+/提高
tags:
  - 排序
  - 二分
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$1 \le n, q \le 2 \times 10^5$，$1 \le L \le 10^9$，$0 \le x_i \le 10^9$，$0 \le t_j \le 10^{18}$。

## 思路

所有点的运动区间长度相同，周期都是 $2L$。设 $t' = t \bmod 2L$，$d = \min(t', 2L - t')$：

- 初始向右（$c_i = 0$）的点，$t'$ 秒后位于 $x_i + d$；
- 初始向左（$c_i = 1$）的点，$t'$ 秒后位于 $x_i + L - d$。

$t' \le L$ 时就是匀速走 $t'$ 秒；$t' > L$ 时已经到达端点并折返，等效于只走了 $2L - t'$ 秒。

把点按 $c_i$ 分成两组，各自排序得到数组 $A$、$B$。询问时刻两组的位置分别为 $A_i + d$ 与 $B_i + L - d$，两个数组都仍然有序，问题转化为：两个有序数组归并后求第 $k$ 小。

二分从 $A$ 中取的元素个数 $x$：从 $A$ 中取前 $x$ 个，从 $B$ 中取前 $k - x$ 个，其中 $\max(0, k - |B|) \le x \le \min(|A|, k)$。这 $k$ 个数恰好构成全体元素的前 $k$ 小，当且仅当：

- $A$ 中取出的最大值不超过 $B$ 中未取的最小值：$A_{x-1} + d \le B_{k-x} + L - d$（当 $x > 0$ 且 $k - x < |B|$ 时需检查）；
- $B$ 中取出的最大值不超过 $A$ 中未取的最小值：$B_{k-x-1} + L - d \le A_x + d$（当 $k - x > 0$ 且 $x < |A|$ 时需检查）。

第一个条件随 $x$ 增大单调变难，第二个条件随 $x$ 增大单调变易，两者必有交集（第 $k$ 小一定存在）。因此二分出满足第一个条件的最大 $x$ 后，第二个条件自动成立，答案为

$$\max(A_{x-1} + d,\ B_{k-x-1} + L - d)$$

某一边一个都不取时，只取另一边对应的元素即可。

## 复杂度

排序 $O(n \log n)$；每个询问二分 $O(\log n)$。总时间复杂度 $O(n \log n + q \log n)$，空间复杂度 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.collection.*
import std.sort.*

main() {
    let reader = getStdIn()
    let line0 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = line0[0]
    let q = line0[1]
    let L = line0[2]

    var listA = ArrayList<Int64>()
    var listB = ArrayList<Int64>()
    for (_ in 0..n) {
        let xy = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        if (xy[1] == 0) {
            listA.add(xy[0])
        } else {
            listB.add(xy[0])
        }
    }
    let na = listA.size
    let nb = listB.size
    sort(listA)
    sort(listB)

    for (_ in 0..q) {
        let tk = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let t = tk[0]
        let k = tk[1]
        let period = 2 * L
        let tp = t % period
        let d = if (tp <= L) { tp } else { period - tp }
        var lo = k - nb
        if (lo < 0) {
            lo = 0
        }
        var hi = k
        if (hi > na) {
            hi = na
        }
        // 二分最大的 x，满足条件 1：A 中取出的最大值 <= B 中未取的最小值
        while (lo < hi) {
            let mid = (lo + hi + 1) / 2
            let good = mid == 0 || k - mid >= nb || listA[mid - 1] + d <= listB[k - mid] + L - d
            if (good) {
                lo = mid
            } else {
                hi = mid - 1
            }
        }
        // 条件 2（B 中取出的最大值 <= A 中未取的最小值）在数学上必然满足；答案取两边取出的最大值
        var ans = if (lo > 0) { listA[lo - 1] + d } else { listB[k - 1] + L - d }
        if (k - lo > 0) {
            let cand = listB[k - lo - 1] + L - d
            if (cand > ans) {
                ans = cand
            }
        }
        println(ans)
    }
}
```
