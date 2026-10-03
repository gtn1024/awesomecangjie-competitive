---
oj: dmy
pid: '461'
title: '[R74E] 三角形具有稳定性'
difficulty: 普及+/提高
tags:
  - 排序
  - 双指针
  - 鸽巢原理
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$1 \le T \le 10^4$，$3 \le n \le 2 \times 10^5$，$1 \le l_i, a_i \le 10^9$，所有测试用例中 $n$ 的总和不超过 $2 \times 10^5$。

## 思路

不稳定度只与所选三根木棒的强度最大值、最小值有关，因此先按强度 $a$ 升序排列所有木棒，这样任意一次合法选择对应的就是排序后的一段连续区间：设所选三根木棒在排序后位于下标 $p < q < r$，其不稳定度恰为 $a_r - a_p$。

记 $f(i)$ 为最小的 $j \ge i$，使得区间 $[i, j]$ 内存在三根木棒能围成非退化三角形（不存在则记为正无穷）。那么

$$\text{答案} = \min_i \bigl(a_{f(i)} - a_i\bigr).$$

一方面，$[i, f(i)]$ 内某个合法选择的不稳定度不超过 $a_{f(i)} - a_i$，所以答案不超过右端；另一方面，取全局最优选择 $p < q < r$，由于 $[p, r]$ 内已存在合法选择，必有 $f(p) \le r$，于是 $\min_i (a_{f(i)} - a_i) \le a_{f(p)} - a_p \le a_r - a_p$，即答案不小于右端。两边夹逼说明二者相等。

**$f$ 单调不降**：若 $j < f(i)$，则 $[i, j]$ 内无合法选择，而 $[i+1, j] \subseteq [i, j]$，因此 $[i+1, j]$ 内也无合法选择，故 $f(i+1) \ge f(i)$。于是可以用双指针维护一个滑动窗口，$j$ 只增不减，通过不断右移 $j$ 找到当前的 $f(i)$。

还剩两个问题：如何判断一个窗口内是否存在合法选择，以及窗口究竟能有多大。

**判断合法选择**：把窗口内的长度升序排序。若存在相邻三元组 $v_{t-2} + v_{t-1} > v_t$，显然就有合法选择；反之若所有相邻三元组都不满足，则序列满足 $v_t \ge v_{t-1} + v_{t-2}$，归纳可知对任意 $t \ge 3$ 都有 $v_{t-2} + v_{t-1} \le v_t$，于是任意三元组（取最小的两个与最大的一个）都无法围成三角形。所以只需检查排序后相邻的三元组。

**窗口上界**：若窗口内不存在合法选择，排序后有 $v_1 \ge 1, v_2 \ge 1$，且 $v_t \ge v_{t-1} + v_{t-2}$，故 $v_t \ge F_t$（斐波那契数列）。而 $F_{45} = 1134903170 > 10^9 \ge v_{45}$，矛盾。因此任意 $45$ 根木棒中必能围出非退化三角形，窗口大小恒不超过 $45$（更精确地说，$f(i) - i + 1 \le 45$）：若 $f(i) - i + 1 > 45$，则 $[i, f(i)-1]$ 已有 $45$ 根木棒、必含合法选择，与 $f(i)$ 的最小性矛盾）。

于是只需维护窗口内一个长度不超过 $45$ 的有序数组，插入、删除与判断各花费 $O(45)$；$j$ 单调右移，总移动量 $O(n)$。

## 复杂度

时间 $O(n \log n)$（主要是按强度排序），空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.sort.*

let reader = getStdIn()

func insertSorted(buf: Array<Int64>, sz: Int64, v: Int64): Int64 {
    var p = sz - 1
    while (p >= 0 && buf[p] > v) {
        buf[p + 1] = buf[p]
        p -= 1
    }
    buf[p + 1] = v
    return sz + 1
}

func removeSorted(buf: Array<Int64>, sz: Int64, v: Int64): Int64 {
    var p = 0
    while (buf[p] != v) {
        p += 1
    }
    while (p + 1 < sz) {
        buf[p] = buf[p + 1]
        p += 1
    }
    return sz - 1
}

func hasTriangle(buf: Array<Int64>, sz: Int64): Bool {
    if (sz >= 45) {
        return true
    }
    var t = 2
    while (t < sz) {
        if (buf[t - 2] + buf[t - 1] > buf[t]) {
            return true
        }
        t += 1
    }
    return false
}

func solve(): Unit {
    let n = Int64.parse(reader.readln().getOrThrow())
    let ls = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let sa = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let idx = Array<Int64>(n, { i => i })
    sort(idx, lessThan: { x: Int64, y: Int64 => sa[x] < sa[y] })
    let l = Array<Int64>(n, { i => ls[idx[i]] })
    let a = Array<Int64>(n, { i => sa[idx[i]] })
    let buf = Array<Int64>(64, { _ => 0 })
    var sz = 0
    var i = 0
    var j = -1
    var ans = Int64.Max
    while (i < n) {
        if (j < i) {
            j += 1
            sz = insertSorted(buf, sz, l[j])
        }
        while (j + 1 < n && !hasTriangle(buf, sz)) {
            j += 1
            sz = insertSorted(buf, sz, l[j])
        }
        if (hasTriangle(buf, sz)) {
            let d = a[j] - a[i]
            if (d < ans) {
                ans = d
            }
        }
        sz = removeSorted(buf, sz, l[i])
        i += 1
    }
    if (ans == Int64.Max) {
        println("-1")
    } else {
        println(ans)
    }
}

main() {
    let t = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..t) {
        solve()
    }
}
```

</details>
