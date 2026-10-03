---
oj: dmy
pid: '354'
title: '[R57A] FakeAge'
difficulty: 入门
tags:
  - 构造
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：输出一个满足 $18 \le x \le 120$ 的非负整数即可满分。

## 思路

这是一道签到题。输入只有一行 `Your Age:`，不含任何需要解析的数据，唯一的要求是输出的年龄在 $[18, 120]$ 之间：小于 $18$ 会被防沉迷系统判定为未成年人，大于 $120$ 会被判定为虚假信息，两者都得 $0$ 分。题面给出的两个样例（$5$ 和 $150$）正是错误示例。

因此直接输出区间内的任意一个整数，例如 $18$，即可通过全部测试点。

复杂度：时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*

main() {
    let reader = getStdIn()
    reader.readln()
    println(18)
}
```

</details>
