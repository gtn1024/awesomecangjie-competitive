---
oj: dmy
pid: '245'
title: '[R40B] Yet another sequence problem'
difficulty: 普及-
tags:
  - 前缀和
  - 枚举
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 5000$，$1 \le a_i, k \le 5000$。

## 思路

下标 $i$ 是「极好的」当且仅当存在一个区间和为 $k - a_i$。设 $target = k - a_i$，由于 $a_i \ge 1$，$target \le 0$ 时一定不满足，直接跳过。

先枚举所有区间：用前缀和 $O(1)$ 求每个区间 $[l, r]$ 的和 $s$，若 $s \le k$ 则把 `exist[s]` 标记为真。因为所有 $target$ 都不超过 $k$，标记数组只需开到 $k + 1$。

最后对每个 $i$，检查 `exist[k - a[i]]` 是否为真并计数。

复杂度：时间 $O(n^2)$，空间 $O(n + k)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let nk = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = nk[0]
    let k = nk[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    var pref = Array<Int64>(n + 1, { _ => 0 })
    for (i in 0..n) {
        pref[i + 1] = pref[i] + a[i]
    }
    var exist = Array<Bool>(k + 1, { _ => false })
    for (l in 0..n) {
        for (r in (l + 1)..(n + 1)) {
            let s = pref[r] - pref[l]
            if (s <= k) {
                exist[s] = true
            }
        }
    }
    var ans: Int64 = 0
    for (i in 0..n) {
        let target = k - a[i]
        if (target >= 1 && exist[target]) {
            ans = ans + 1
        }
    }
    println(ans)
}
```

</details>

要点：

- 前缀和数组 `pref` 长度为 $n+1$，区间 $[l, r]$（0 起下标）的和是 `pref[r + 1] - pref[l]`，外层枚举左端点、内层枚举右端点即可覆盖全部区间。
- 区间和超过 $k$ 的区间对答案没有贡献（没有任何 $target$ 会超过 $k$），跳过标记即可。
