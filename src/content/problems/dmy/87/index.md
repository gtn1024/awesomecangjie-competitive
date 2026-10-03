---
oj: dmy
pid: '87'
title: '[R15C] 订单处理'
difficulty: 入门
tags:
  - 排序
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^5$，$1 \le a_i, t_i \le 10^9$，各订单提交时刻互不相同。

## 思路

订单只在提交瞬间决定是否被处理，能否立刻开始取决于当时是否还有订单正在处理。因此只需按提交时刻 $a_i$ 从早到晚依次扫描：维护上一个开始处理的订单的完成时刻 `now`（初始为 $0$）。

对当前订单 $i$：

- 若 `now <= a_i`，说明它提交时机器空闲，立即开始处理，更新 `now = a_i + t_i`；
- 否则它提交时有订单正在处理，当前订单被取消，记录其原始编号。

扫描结束后若无取消订单输出 `Perfect`，否则将记录的编号排序后输出。

排序保证扫描顺序与真实时间顺序一致，所以只需维护一个 `now` 而无需关心更早被取消订单的处理时间。

复杂度：时间 $O(n \log n)$，空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.collection.*
import std.convert.*
import std.env.*
import std.sort.*

func solve() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let nn = n
    let a = Array<Int64>(nn, { _ => 0 })
    let t = Array<Int64>(nn, { _ => 0 })
    for (i in 0..nn) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
        a[i] = line[0]
        t[i] = line[1]
    }
    let order = Array<Int64>(nn, { i => i })
    sort(order, key: { i => a[i] })
    let ans = ArrayList<Int64>()
    var now: Int64 = 0
    for (k in 0..nn) {
        let i = order[k]
        if (now <= a[i]) {
            now = a[i] + t[i]
        } else {
            ans.add(i + 1)
        }
    }
    if (ans.size == 0) {
        println("Perfect")
    } else {
        sort(ans)
        var first = true
        for (x in ans) {
            if (first) {
                first = false
            } else {
                print(" ")
            }
            print(x)
        }
        println()
    }
}

main() {
    solve()
}
```

</details>

要点：

- 用下标数组 `order` 配合 `sort(order, key: { i => a[i] })` 按提交时刻排序，避免改动原始输入并保留订单编号。
- `now` 初值取 $0$：由于 $a_i \ge 1$，首个提交的订单必然满足 `now <= a_i` 而开始处理。
- 取消订单需按编号从小到大输出，所以记录完后再 `sort(ans)` 一次；输出时空格只作分隔符，首项前不加空格。
- $a_i + t_i$ 最大可达 $2 \times 10^9$，用 `Int64` 存储。
