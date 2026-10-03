---
oj: dmy
pid: '238'
title: '[R39B]倍数'
difficulty: 普及
tags:
  - 枚举
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，满足 $1\le n\le 5000$，$1\le a_i\le n$。

## 思路

$n\le 5000$，子数组总数约为 $\dfrac{n(n+1)}{2}\approx 1.25\times 10^7$，可以直接 $O(n^2)$ 枚举所有子数组。

固定左端点 $l$，向右枚举右端点 $r$，维护当前段 $[l,r]$ 的最大值 $mx$ 与最小值 $mn$。每加入一个 $a_r$，用 $O(1)$ 时间更新：

- $mx\leftarrow \max(mx, a_r)$
- $mn\leftarrow \min(mn, a_r)$

若 $mx\bmod mn=0$，则该子数组满足条件，答案加一。由于 $a_i\ge 1$，$mn\ge 1$，取模不会除零。

## 复杂度

- 时间：$O(n^2)$，约 $1.25\times 10^7$ 次基本运算，在 1s 时限内绰绰有余。
- 空间：$O(n)$，仅存储输入数组与少量变量。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    var ans: Int64 = 0
    var l = 0
    while (l < n) {
        var mx = a[l]
        var mn = a[l]
        var r = l
        while (r < n) {
            if (a[r] > mx) {
                mx = a[r]
            }
            if (a[r] < mn) {
                mn = a[r]
            }
            if (mx % mn == 0) {
                ans = ans + 1
            }
            r = r + 1
        }
        l = l + 1
    }
    println(ans)
}
```

</details>
