---
oj: dmy
pid: '482'
title: '[R78B] 国王收金币啦'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le k \le 5000$。

## 思路

第 $d$ 天收取的金币数等于 $1$ 加上「不超过 $d$ 的完全平方数个数」（第 $1$ 天本身是完全平方数，它结束后每天多收 $1$ 枚，所以第 $2$ 天起每天收 $2$ 枚，依此类推）。

直接按题意模拟：维护当前每天收取的数量 $cur$ 和下一个完全平方数的平方根 $sq$，从第 $1$ 天遍历到第 $k$ 天，每天累加 $cur$；若当天 $d=sq^2$，说明这一天结束后要涨价，把 $cur$ 加 $1$、$sq$ 加 $1$。

## 复杂度

时间复杂度 $O(k)$，空间复杂度 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let k = Int64.parse(reader.readln().getOrThrow())
    var ans: Int64 = 0
    var cur: Int64 = 1
    var d: Int64 = 1
    var sq: Int64 = 1
    while (d <= k) {
        ans += cur
        if (d == sq * sq) {
            cur += 1
            sq += 1
        }
        d += 1
    }
    println(ans)
}
```

</details>
