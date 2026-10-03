---
oj: dmy
pid: '466'
title: '[R75D] 频道校准'
difficulty: 提高
tags:
  - 数论
  - 枚举
  - 约数
timeLimit: 2s
memoryLimit: 256m
---

> 数据规模：$2 \le n \le 200$ 且 $n$ 为偶数，$1 \le a_i \le 10^9$，所有 $a_i$ 互不相同。

## 思路

$d$ 合法，等价于每个实际出现的余数都恰好出现两次，也就是把 $a_i \bmod d$ 排序后每一段连续相等的长度都为 $2$。

直接枚举 $d$ 不可行（$d$ 可以到 $10^9$），需要缩小候选范围。两个关键观察：

- **合法周期一定整除某个差值。** 取编号 $a_0$ 的设备，它所在的频道恰好有两台设备，另一台设为 $a_j$，于是 $a_j \equiv a_0 \pmod d$，即 $d \mid |a_j - a_0|$。因此 $d$ 必定是 $|a_i - a_0|$（$i = 1, \dots, n-1$）中某个数的约数，候选集就是这 $n-1$ 个数的约数并集。
- **合法周期一定不小于 $n/2$。** 每个出现的余数互不相同，共有 $n/2$ 个，而余数都落在 $[0, d-1]$ 内，故 $d \ge n/2$。

把候选约数全部求出、去重并按升序排好，从大到小逐个检查合法性，第一个合法的就是答案；若一直检查到小于 $n/2$ 仍无合法值，则输出 `-1`（再小的 $d$ 也一定不合法）。

检查单个 $d$ 时，先做一次廉价预筛：与 $a_0$ 同余的设备必须恰好有一台，否则直接排除；通过后再把 $a_i \bmod d$ 排序，逐段确认长度为 $2$。这样可以避免对绝大多数候选做排序。

## 复杂度

设候选约数个数为 $M$（上界为 $n \times 1344$），其中生成候选需要枚举 $n - 1$ 个差值的约数，耗时 $O(n\sqrt{A})$，$A = \max_{i \ge 1} |a_i - a_0|$。单个候选的检查为 $O(n \log n)$，总时间复杂度 $O(n\sqrt{A} + M n \log n)$；空间复杂度 $O(n + M)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.sort.*
import std.collection.*

// 判断 d 是否为合法频道周期：所有余数恰好出现两次
func valid(a: Array<Int64>, d: Int64, buf: Array<Int64>): Bool {
    let n = a.size
    // 先做一次廉价预筛：0 号设备的同余伙伴必须恰好只有一个
    var cnt = 0
    for (i in 1..n) {
        if ((a[i] - a[0]) % d == 0) {
            cnt += 1
        }
    }
    if (cnt != 1) {
        return false
    }

    for (i in 0..n) {
        buf[i] = a[i] % d
    }
    sort(buf)
    var i = 0
    while (i < n) {
        var j = i + 1
        while (j < n && buf[j] == buf[i]) {
            j += 1
        }
        if (j - i != 2) {
            return false
        }
        i = j
    }
    return true
}

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    // 合法周期必定整除某个 |a_i - a_0|（0 号设备的同余伙伴）
    let cand = ArrayList<Int64>()
    for (i in 1..n) {
        var x = a[i] - a[0]
        if (x < 0) {
            x = -x
        }
        var p: Int64 = 1
        while (p * p <= x) {
            if (x % p == 0) {
                cand.add(p)
                if (p * p != x) {
                    cand.add(x / p)
                }
            }
            p += 1
        }
    }
    sort(cand)

    // 去重
    let uniq = ArrayList<Int64>()
    var last: Int64 = -1
    for (v in cand) {
        if (v != last) {
            uniq.add(v)
            last = v
        }
    }

    let buf = Array<Int64>(n, { _ => 0 })
    var idx = uniq.size - 1
    while (idx >= 0) {
        let d = uniq[idx]
        // 共有 n/2 个互不相同的余数，均落在 [0, d-1] 内，故 d >= n/2
        if (d < n / 2) {
            break
        }
        if (valid(a, d, buf)) {
            println(d)
            return 0
        }
        idx -= 1
    }
    println(-1)
    return 0
}
```

</details>
