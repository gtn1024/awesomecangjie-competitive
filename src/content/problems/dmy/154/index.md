---
oj: dmy
pid: '154'
title: '[R26A]最高积分'
difficulty: 入门
tags:
  - 模拟
  - 前缀和
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 500$，$0 \le r \le 1500$，$-500 \le c_i \le 500$。

## 思路

从初始积分 $r$ 开始，依次累加每场比赛的变化值 $c_i$，得到比赛过程中所有「关键时刻」的积分序列：初始积分，以及每场比赛结束后的积分。题目要求的就是这个序列的最大值。

用一个变量维护当前积分 `cur`（初始为 $r$），一个变量维护历史最大值 `ans`（也初始为 $r$，因为初始积分也要参与比较）。每读入一个变化值就把它加到 `cur` 上，并用 `cur` 更新 `ans`。最后输出 `ans` 即可。

注意积分可能为负数，`ans` 的初值必须设成初始积分 $r$，而不能想当然地设为 $0$。

## 复杂度

时间 $O(n)$，空间 $O(n)$（用于存储输入数组；若边读边算可降到 $O(1)$ 额外空间）。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let line1 = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(line1[0])
    let r = Int64.parse(line1[1])
    let c = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    var cur = r
    var ans = r
    for (i in 0..n) {
        cur += c[i]
        if (cur > ans) {
            ans = cur
        }
    }
    println(ans)
}
```

</details>
