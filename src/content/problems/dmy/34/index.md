---
oj: dmy
pid: '34'
title: '[R6D] 数字矩阵'
difficulty: 入门
tags:
  - 二分
  - 计数
timeLimit: 1s
memoryLimit: 512m
---

## 思路

$A_i, B_i \le 2 \times 10^4$，乘积值域只有 $4 \times 10^8$，按值域计数。

用 `cntA[x]` 表示 $A$ 中等于 $x$ 的个数，`prefCnt[x]`、`prefSum[x]` 分别表示 $B$ 中 $\le x$ 的个数与和。对阈值 $v$，乘积 $\le v$ 的个数与和为

$$\sum_{a} cntA[a] \times prefCnt[v/a], \qquad \sum_{a} cntA[a] \times a \times prefSum[v/a]$$

每次 $O(2 \times 10^4)$，可配合二分求第 $k$ 小值。

设 $v_1$ 为第 $L$ 小的值、$v_2$ 为第 $R$ 小的值，$f(x)$、$g(x)$ 分别为乘积 $\le x$ 的个数与和：

- $v_1 = v_2$ 时答案为 $(R - L + 1) \times v_1$；
- 否则答案为 $(f(v_1) - L + 1) \times v_1 + (R - f(v_2 - 1)) \times v_2 + (g(v_2 - 1) - g(v_1))$。

复杂度：时间 $O((n + m + V) \log V)$（$V = 2 \times 10^4$），空间 $O(V)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

const MAXV: Int64 = 20000

func countSum(cntA: Array<Int64>, prefCnt: Array<Int64>, prefSum: Array<Int64>, x: Int64): (Int64, Int64) {
    if (x <= 0) {
        return (0, 0)
    }
    var cnt: Int64 = 0
    var sum: Int64 = 0
    for (a in 1..(MAXV + 1)) {
        let ca = cntA[a]
        if (ca > 0) {
            var q = x / a
            if (q > MAXV) {
                q = MAXV
            }
            cnt += ca * prefCnt[q]
            sum += ca * a * prefSum[q]
        }
    }
    (cnt, sum)
}

func findV(cntA: Array<Int64>, prefCnt: Array<Int64>, prefSum: Array<Int64>, target: Int64): Int64 {
    var lo: Int64 = 1
    var hi: Int64 = MAXV * MAXV
    while (lo < hi) {
        let mid = (lo + hi) / 2
        let (c, _) = countSum(cntA, prefCnt, prefSum, mid)
        if (c >= target) {
            hi = mid
        } else {
            lo = mid + 1
        }
    }
    lo
}

main() {
    let reader = getStdIn()
    let l1 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let lr = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let l = lr[0]
    let r = lr[1]
    let cntA = Array<Int64>(MAXV + 1, { _ => 0 })
    let cntB = Array<Int64>(MAXV + 1, { _ => 0 })
    for (v in a) {
        cntA[v] += 1
    }
    for (v in b) {
        cntB[v] += 1
    }
    let prefCnt = Array<Int64>(MAXV + 1, { _ => 0 })
    let prefSum = Array<Int64>(MAXV + 1, { _ => 0 })
    for (v in 1..(MAXV + 1)) {
        prefCnt[v] = prefCnt[v - 1] + cntB[v]
        prefSum[v] = prefSum[v - 1] + cntB[v] * v
    }
    let v1 = findV(cntA, prefCnt, prefSum, l)
    let v2 = findV(cntA, prefCnt, prefSum, r)
    var ans: Int64 = 0
    if (v1 == v2) {
        ans = (r - l + 1) * v1
    } else {
        let (c1, _) = countSum(cntA, prefCnt, prefSum, v1 - 1)
        let (c2, s2) = countSum(cntA, prefCnt, prefSum, v2 - 1)
        let (c3, s3) = countSum(cntA, prefCnt, prefSum, v1)
        ans = (c3 - l + 1) * v1 + (r - c2) * v2 + (s2 - s3)
    }
    println(ans)
}
```
