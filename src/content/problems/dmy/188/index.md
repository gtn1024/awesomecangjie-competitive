---
oj: dmy
pid: '188'
title: '[R31C]交换小球'
difficulty: 提高
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> $2 \leq n \leq 10^5$，$1 \leq Q \leq 10^5$，$1 \leq a_i, b_i \leq n$，$a_i \neq b_i$。
> 时间限制 1S，内存限制 512M。

## 思路

$n$ 个球排成圆环，位置 $i$ 上初始放着写有数字 $i$ 的球。每次操作给出 $a_i, b_i$，要交换「写着 $a_i$ 的球」和「写着 $b_i$ 的球」所在的位置。最后从写着 $1$ 的球开始，顺时针输出一圈。

直接模拟「每个位置上放着哪个数字」需要先按值查找位置，单次操作 $O(n)$，不可接受。换个视角，维护反向映射：

$$pos[v] = \text{写有数字 } v \text{ 的球当前所在的位置}$$

初始时 $pos[v] = v$。每次操作给出值 $a_i, b_i$，它们所在的位置就是 $pos[a_i], pos[b_i]$，只要交换 $pos[a_i]$ 与 $pos[b_i]$ 即可，单次 $O(1)$。

所有操作结束后，再由 $pos$ 反推 $val[p] = \text{位置 } p \text{ 上的数字}$：对每个 $v \in [1, n]$，令 $val[pos[v]] = v$。

最后输出时从位置 $pos[1]$ 开始顺时针走一圈，即依次输出

$$val[pos[1]],\ val[pos[1]+1],\ \ldots,\ val[n],\ val[1],\ \ldots,\ val[pos[1]-1]$$

实现上用一个偏移量 $i \in [0, n)$，对应位置 $((pos[1] - 1 + i) \bmod n) + 1$，按空格分隔输出即可。

## 复杂度

- 时间：$O(n + Q)$，初始化与构造反向映射各 $O(n)$，每次操作 $O(1)$，输出 $O(n)$。
- 空间：$O(n)$，两个长度 $n+1$ 的数组。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let q = first[1]

    // pos[v] = 数字 v 当前所在的位置（1-indexed），初始 pos[v] = v
    var pos = Array<Int64>(n + 1, { i: Int64 => i })

    var k = 0
    while (k < q) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let a = line[0]
        let b = line[1]
        let tmp = pos[a]
        pos[a] = pos[b]
        pos[b] = tmp
        k++
    }

    // 反向映射 val[p] = 位置 p 上的数字
    let val = Array<Int64>(n + 1, { _ => 0 })
    for (v in 1..=n) {
        val[pos[v]] = v
    }

    // 从位置 pos[1] 开始顺时针输出
    let start = pos[1]
    for (i in 0..n) {
        let p = ((start - 1 + i) % n) + 1
        print(val[p])
        if (i < n - 1) {
            print(" ")
        }
    }
    println()
}
```

</details>
