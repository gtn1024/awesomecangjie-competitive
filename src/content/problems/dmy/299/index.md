---
oj: dmy
pid: '299'
title: '[R48D]小球移动'
difficulty: 提高
tags:
  - 构造
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1 \le n \le 2000$，$a$ 为 $1$ 到 $n$ 的一个排列。

## 思路

观察小球的运动过程：球总数守恒，每根柱子上始终恰有一个球。一条连接柱 $p$ 与 $p+1$、高度为 $h$ 的轨道，作用是把当时位于柱 $p$ 和柱 $p+1$ 上的两个小球**交换**位置。所有小球从高度 $10^9$ 一路降到 $0$，**按高度从大到小**依次经过轨道，因此轨道的执行顺序就是「高度从高到低」。

于是问题转化为：用一串相邻交换，把初始排列 $[1, 2, \dots, n]$（柱 $j$ 上的球是 $j$）变换成目标排列 $a$（柱 $j$ 最终落出球 $a_j$）。每条轨道对应一次相邻交换，并被赋予一个互不相同的「高度」；高度从大到小就是执行顺序。

具体地，采用**插入式冒泡**，从左到右依次固定每根柱子：

1. 处理柱 $j$ 时，前 $1 \dots j-1$ 根柱已经就位；
2. 找到球 $a_j$ 当前所在的柱 $q$（必有 $q \ge j$）；
3. 把它从柱 $q$ 一路向左交换到柱 $j$，即依次执行 $(j, j+1), (j+1, j+2), \dots, (q-1, q)$ 这些相邻交换。

整个过程只在 $j \dots q$ 范围内操作，不会干扰已经固定的左侧，最终必能得到 $a$。

**高度赋值**：按执行顺序（也就是记录顺序）依次赋递减的高度。第一条执行的轨道最高，赋 $10^9 - 1$，之后每条减 $1$，保证 $0 < h < 10^9$ 且互不相同。输出顺序随意（评测机按高度排序执行），这里直接按执行顺序输出最方便。

## 正确性

每条相邻交换恰好在两根相邻柱之间搬运两个球，且执行顺序由高度唯一确定。插入式冒泡在处理第 $j$ 根柱时只移动下标 $\ge j$ 的球，因此已固定的前缀不受影响，归纳可知最终各柱上的球恰为 $a$。

## 复杂度

- 交换次数：每根柱至多向左移动 $n-1$ 步，总计 $k \le \dfrac{n(n-1)}{2} < n^2$，满足题目 $0 \le k \le n^2$ 的限制。
- 时间：$O(n^2)$。$n = 2000$ 时 $k \approx 2 \times 10^6$，输出量大，必须用 `StringBuilder` 拼接后一次性输出。
- 空间：$O(n^2)$ 存操作序列；高度用 `Int64` 不会溢出（最小高度 $\approx 10^9 - 2 \times 10^6 > 0$）。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.collection.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let nn = n
    // 目标排列：柱 j（1-indexed）最终落出小球 a[j]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    // 当前每根柱子上的小球：pos[j] 表示柱 (j+1) 上的小球编号
    var pos = Array<Int64>(nn, { i: Int64 => i + 1 })
    // 记录每次相邻交换的柱子编号 p（连接柱 p 与 p+1），按执行顺序（从高到低）
    var ops = ArrayList<Int64>()
    // 从左到右依次把目标球 a_j 移到柱 j
    for (j in 0..nn) {
        let target = a[j]
        // 找到 target 当前所在柱 q（必有 q >= j，因为 0..j-1 已就位）
        var q = j
        while (pos[q] != target) {
            q = q + 1
        }
        // 把 target 从柱 q 一路向左交换到柱 j
        // 交换 pos[k-1],pos[k] 对应柱 k 与 k+1 之间，p = k
        var k = q
        while (k > j) {
            let tmp = pos[k - 1]
            pos[k - 1] = pos[k]
            pos[k] = tmp
            ops.add(k)
            k = k - 1
        }
    }
    // 输出：第一行 k，接下来 k 行 "h p"
    // 执行顺序即 ops 的顺序；第一个最先执行（最高轨道），高度递减
    let k = Int64(ops.size)
    var sb = StringBuilder()
    sb.append(k.toString())
    sb.append("\n")
    var h: Int64 = 1000000000 - 1
    for (i in 0..k) {
        sb.append(h.toString())
        sb.append(" ")
        sb.append(ops[i].toString())
        sb.append("\n")
        h = h - 1
    }
    print(sb.toString())
    return 0
}
```

## 关键点

- 把「轨道」抽象为「相邻交换」，把「高度从大到小」抽象为「交换执行顺序」，是本题的核心观察。
- 插入式冒泡保证已固定的前缀不被破坏，且交换总数严格小于 $n^2$。
- 输出量可达百万行，必须用 `StringBuilder` 一次性输出，否则会 TLE。
