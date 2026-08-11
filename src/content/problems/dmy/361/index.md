---
oj: dmy
pid: '361'
title: '[R58B] 拍照'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 1000$，$0 \le X \le 1000$，$1 \le P, a_i \le 1000$。

## 思路

按时间顺序直接模拟拍摄过程：用变量 `next` 记录下一个可以拍摄的秒数，初始为 $1$。扫描第 $1$ 到 $n$ 秒，若当前秒数不小于 `next` 且 $a_i \ge P$，则拍下一张照片、计数加一，并令 `next = i + X + 1`（第 $i$ 秒按下快门后，第 $i+1$ 至 $i+X$ 秒处于冷却，第 $i+X+1$ 秒恢复）。

$X = 0$ 时 `next = i + 1`，即下一秒仍可拍摄，与题意一致。

复杂度：时间 $O(n)$，空间 $O(n)$（仅用于存 $a$）。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let X = first[1]
    let P = first[2]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    var ans = 0
    var next = 1
    for (i in 0..n) {
        if (i + 1 >= next && a[i] >= P) {
            ans += 1
            next = i + 1 + X + 1
        }
    }
    println(ans)
    return 0
}
```

要点：

- 循环变量 `i` 从 $0$ 开始，对应第 $i + 1$ 秒，避免区间边界出错。
- 拍摄条件可合并为一个 `if`，冷却结束的秒数随每次拍摄直接更新，无需额外的冷却倒计时。
