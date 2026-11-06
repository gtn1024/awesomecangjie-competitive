---
oj: dmy
pid: '524'
title: '[R82B] 键盘'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$c$ 为 `a` 到 `z` 之间的小写英文字母，只有一次询问。

## 思路

三行字母左对齐，所以可以把键盘看成一个 $3$ 行的字符网格：第 $0$ 行为 `qwertyuiop`（$10$ 列），第 $1$ 行为 `asdfghjkl`（$9$ 列），第 $2$ 行为 `zxcvbnm`（$7$ 列）。行内从左到右的下标就是列号，短行右侧的空位不存字母。

**定位。** 先在三行里扫一遍，找到 $c$ 所在的行 `curR` 与列 `curC`。

**枚举邻居。** 邻居是共边或共顶点的 $8$ 个方向，即行号取 `curR-1` 到 `curR+1`、列号取 `curC-1` 到 `curC+1`，再去掉自己那一格。把行号限制在 $[0,2]$、列号限制在该行长度内，就越过了「没有字母的位置不计入邻居」的边界。

**输出顺序。** 题目要求从上到下、同一行从左到右。外层循环按行号从 `curR-1` 递增到 `curR+1`，内层循环按列号从 `curC-1` 递增到 `curC+1`，顺序天然就对了，逐个字符拼接后输出即可。

以 `g` 为例，`g` 在第 $1$ 行第 $4$ 列，上一行第 $3,4,5$ 列为 `r`、`t`、`y`，本行第 $3,5$ 列为 `f`、`h`，下一行第 $3,4,5$ 列为 `v`、`b`、`n`，拼接得到 `rtyfhvbn`。

## 复杂度

在 $3$ 行共 $26$ 个字母里定位，再枚举至多 $3\times 3$ 个格子，时间 $O(1)$，额外空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*

main() {
    let reader = getStdIn()
    let target = reader.readln().getOrThrow().toRuneArray()[0]
    let rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"]
    var curR = 0
    var curC = 0
    for (i in 0..3) {
        let ra = rows[i].toRuneArray()
        for (j in 0..ra.size) {
            if (ra[j] == target) {
                curR = i
                curC = j
            }
        }
    }
    let sb = StringBuilder()
    var rr = curR - 1
    if (rr < 0) {
        rr = 0
    }
    while (rr <= curR + 1 && rr <= 2) {
        let ra = rows[rr].toRuneArray()
        var cc = curC - 1
        if (cc < 0) {
            cc = 0
        }
        while (cc <= curC + 1 && cc < ra.size) {
            if (rr != curR || cc != curC) {
                sb.append(ra[cc])
            }
            cc += 1
        }
        rr += 1
    }
    println(sb.toString())
}
```

</details>
