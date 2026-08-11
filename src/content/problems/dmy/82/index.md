---
oj: dmy
pid: '82'
title: '[R14D]训练指令2'
difficulty: 普及/提高-
tags:
  - 模拟
  - 置换
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$1 \le n, m \le 10^6$，$1 \le q \le 10^6$。$1$ 类指令保证 $1 \le x < y \le n$，$2$ 类指令保证 $1 \le x < y \le m$。

## 思路

如果真的维护 $n \times m$ 的方阵，每条 $1/2$ 类指令就要搬动一整行或一整列，单次 $O(\max(n, m))$，总复杂度 $O(q(n+m))$ 必然超时。

关键观察：**行的交换与列的交换互相独立**。第 $1$ 类指令只整行换，它决定一个同学最终位于「哪一行」，而完全不影响「哪一列」；第 $2$ 类指令恰好相反。所以可以把行号和列号分开各维护一个置换。

具体地，令：

- $r[i]$ 表示「现在位于第 $i$ 行的同学，初始时位于第几行」，初值 $r[i] = i$；
- $c[j]$ 表示「现在位于第 $j$ 列的同学，初始时位于第几列」，初值 $c[j] = j$。

每条指令只需 $O(1)$ 处理：

- $1\ x\ y$：交换 $r[x]$ 与 $r[y]$；
- $2\ x\ y$：交换 $c[x]$ 与 $c[y]$；
- $3\ x\ y$：现在坐在 $(x, y)$ 的同学，初始时坐在 $(r[x], c[y])$，编号为 $(r[x]-1) \times m + c[y]$，直接输出。

为什么这样是对的？以行为例，一次「第 $x$ 行与第 $y$ 行整列交换」等价于把「当前在第 $x$ 行的那批同学」和「当前在第 $y$ 行的那批同学」整体对调，也就是把置换 $r$ 中第 $x$、$y$ 两个位置的值对调，列方向上完全不受影响。同理列交换只改 $c$。于是行、列各自的置换在指令序列上独立累加，最后查询时再把行、列两端的初始位置合成就得到答案。

整体时间复杂度 $O(n + m + q)$，空间复杂度 $O(n + m)$。$n, m, q$ 都到 $10^6$ 时把两个置换数组用 `UInt32` 存储可以显著降低内存占用。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*
import std.collection.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = first[0]
    let m = first[1]
    let q = first[2]

    // r[i] 表示现在位于第 i 行的同学初始时所在的行号；c[j] 同理表示列。
    // 行的交换与列的交换互相独立，分别用置换数组维护即可。
    let r = Array<UInt32>(n + 1, { i => UInt32(i) })
    let c = Array<UInt32>(m + 1, { i => UInt32(i) })

    let out = StringBuilder()
    var i = 0
    while (i < q) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
        let op = line[0]
        let x = line[1]
        let y = line[2]
        if (op == 1) {
            let t = r[x]
            r[x] = r[y]
            r[y] = t
        } else if (op == 2) {
            let t = c[x]
            c[x] = c[y]
            c[y] = t
        } else {
            let ans = (Int64(r[x]) - 1) * m + Int64(c[y])
            out.append(ans)
            out.append("\n")
        }
        i = i + 1
    }
    print(out.toString())
}
```

要点：

- 「行交换只动行置换、列交换只动列置换」是本题的核心；想清楚这一点后，三 类询问就是一次 $O(1)$ 的合成，完全摆脱了方阵规模。
- $q$ 次输出逐条 `print` 会产生大量 IO 开销，用 `StringBuilder` 收集后再一次性输出更稳妥。
