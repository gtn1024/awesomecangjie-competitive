---
oj: dmy
pid: '503'
title: 数字消除游戏
difficulty: 普及−
tags:
  - 线性DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le n \le 10^5$，$1 \le a_i \le 10^5$。

## 思路

**数值相同的整数同生共死。** 选 $x$ 会移除所有数值为 $x$ 的整数；不选 $x$，它们最终也只能被 $x-1$ 或 $x+1$ 连带移除，自己不会产生任何得分。所以对每个数值 $v$ 只有两种结局：取走（得分 $v \times cnt_v$，代价是 $v-1$ 和 $v+1$ 都不能再取）或放弃（得分 $0$）。

按值域从小到大做 **线性 DP**。设 $s_v = v \times cnt_v$ 表示取走数值 $v$ 的总得分，$f_v$ 表示只考虑数值不超过 $v$ 时的最大分数，则

$$f_v = \max(f_{v-1},\ f_{v-2} + s_v).$$

即在「不取 $v$」与「取 $v$ 且 $v-1$ 不取」二者中取大——这正是「不能选相邻项」的经典模型。$f$ 只与前两项有关，滚动两个变量即可，无需 DP 数组。

答案为遍历完值域后的 $f$。样例中 $s_1=1$、$s_2=4$、$s_3=6$，有 $f_1=1$、$f_2=4$、$f_3=\max(4, 1+6)=7$。

## 复杂度

时间 $O(n + \max a_i)$，空间 $O(\max a_i)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let m: Int64 = 200002
    let sum = Array<Int64>(m, { _ => 0 })
    for (x in a) {
        sum[x] += x
    }
    var prev: Int64 = 0
    var cur: Int64 = 0
    var v: Int64 = 1
    while (v < m) {
        var nxt = prev + sum[v]
        if (cur > nxt) {
            nxt = cur
        }
        prev = cur
        cur = nxt
        v += 1
    }
    println(cur)
}
```

</details>
