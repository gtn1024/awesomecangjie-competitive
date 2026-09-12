---
oj: dmy
pid: '423'
title: '[R68C] 这是一道01串题3'
difficulty: 入门
tags:
  - 贪心
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$2 \le n \le 2 \times 10^5$，$n$ 为偶数。

## 思路

设原串中 `0` 的个数为 $c_0$、`1` 的个数为 $c_1$。每修改一个字符，只会把一个 `0` 变成 `1` 或反过来，使 $c_0 - c_1$ 变化 $2$ 或 $-2$，因此最少修改次数固定为

$$m = \frac{|c_0 - c_1|}{2}$$

且 $m$ 次修改必须全部同方向：$c_1 > c_0$ 时只能把 `1` 改成 `0`，$c_0 > c_1$ 时只能把 `0` 改成 `1`（否则凑不平数量差）。

在修改次数固定的前提下，再考虑字典序最小：

- $c_1 > c_0$：把 `1` 改成 `0` 会让该位置变小，位置越靠前收益越大，所以改**最靠左的 $m$ 个 `1`**；
- $c_0 > c_1$：把 `0` 改成 `1` 会让该位置变大，为了让改动尽量靠后，所以改**最靠右的 $m$ 个 `0`**。

从左到右扫描一遍即可同时完成计数和选位（选最靠右的 $m$ 个 `0` 时，维护「当前及之后还剩多少个 `0`」，剩余数不超过 $m$ 的 `0` 即被选中）。

复杂度：时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow()
    let runes = s.toRuneArray()
    let nn = n
    var cnt0 = 0
    for (r in runes) {
        if (r == r'0') {
            cnt0++
        }
    }
    let cnt1 = nn - cnt0
    let m = if (cnt0 > cnt1) { (cnt0 - cnt1) / 2 } else { (cnt1 - cnt0) / 2 }
    println(m)
    if (m == 0) {
        println("")
        return 0
    }
    var printed = 0
    if (cnt1 > cnt0) {
        // 1 多：把最靠左的 m 个 1 改成 0
        for (i in 0..nn) {
            if (printed == m) {
                break
            }
            if (runes[i] == r'1') {
                if (printed > 0) {
                    print(" ")
                }
                print(i + 1)
                printed++
            }
        }
    } else {
        // 0 多：把最靠右的 m 个 0 改成 1
        var zerosLeft = cnt0
        for (i in 0..nn) {
            if (runes[i] == r'0') {
                if (zerosLeft <= m) {
                    if (printed > 0) {
                        print(" ")
                    }
                    print(i + 1)
                    printed++
                }
                zerosLeft--
            }
        }
    }
    println()
    return 0
}
```

要点：

- 两个方向的分支都从左到右输出下标，天然满足输出「按升序排列」的要求。
- $m = 0$ 时第二行输出空行即可。
