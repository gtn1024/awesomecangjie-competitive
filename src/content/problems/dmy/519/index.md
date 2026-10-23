---
oj: dmy
pid: '519'
title: '[R81A] 吃什么？'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$0 \le X \le 100$。

## 思路

四种选择的价格分别是 $0$、$1$、$20$、$50$，而小 A 会挑能负担得起的最贵的一种。把这四种选择按价格从高到低排成一列，从最贵的开始逐个比较，第一个价格不超过 $X$ 的就是答案：

- $X \ge 50$：火锅，输出 `Hotpot`；
- 否则 $X \ge 20$：卤肉饭，输出 `BraisedPorkRice`；
- 否则 $X \ge 1$：白饭，输出 `Rice`；
- 否则：白开水，输出 `Water`。

价格 $0$ 的白开水总能负担，所以判断链一定会落到某个分支，无需额外处理。

注意输出字符串的大小写要与题目给出的形式完全一致，例如 `BraisedPorkRice` 是三个单词首字母大写、中间不加空格。

## 复杂度

时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let x = Int64.parse(getStdIn().readln().getOrThrow())
    if (x >= 50) {
        println("Hotpot")
    } else if (x >= 20) {
        println("BraisedPorkRice")
    } else if (x >= 1) {
        println("Rice")
    } else {
        println("Water")
    }
}
```

</details>
