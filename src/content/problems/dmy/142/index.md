---
oj: dmy
pid: '142'
title: '[R24A]停车费用'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le T, a_i \le 10^4$，$1 \le A < B \le 10^4$。

## 思路

按停车时长 $T$ 分三段计费：

- 若 $T \le A$，全部落入第一档，固定收费 $a_1$ 元。
- 若 $A < T \le B$，前 $A$ 小时收 $a_1$ 元，超出 $A$ 小时的部分共 $(T - A)$ 小时按每小时 $a_2$ 元收费。
- 若 $T > B$，前 $A$ 小时收 $a_1$ 元，中间 $A$ 到 $B$ 这 $(B - A)$ 小时按每小时 $a_2$ 元收费，超出 $B$ 的部分共 $(T - B)$ 小时按每小时 $a_3$ 元收费。

直接按 $T$ 与 $A, B$ 的大小关系套用对应公式即可。

## 复杂度

时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let A = line[0]
    let B = line[1]
    let T = line[2]
    let a1 = line[3]
    let a2 = line[4]
    let a3 = line[5]

    var ans: Int64 = 0
    if (T <= A) {
        ans = a1
    } else if (T <= B) {
        ans = a1 + (T - A) * a2
    } else {
        ans = a1 + (B - A) * a2 + (T - B) * a3
    }
    println(ans.toString())
    return 0
}
```
