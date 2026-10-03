---
oj: dmy
pid: '239'
title: '[R39C]网格求和'
difficulty: 提高
tags:
  - 前缀和
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $40\%$ 的数据，$1 \le n, m \le 100$。
>
> 对于 $100\%$ 的数据，$1 \le n, m \le 2000$，$0 \le A_{i,j} \le 10^9$。

## 思路

对于每个 $B_{i,j}$，需要把第 $i$ 行的所有格子和第 $j$ 列的所有格子求和。第 $i$ 行和第 $j$ 列的并集里，$A_{i,j}$ 同时属于行和列，被加了两次，需要减去一次，即：

$$
B_{i,j} = \sum_{k} A_{i,k} + \sum_{k} A_{k,j} - A_{i,j}
$$

如果对每个 $(i,j)$ 都暴力求和，复杂度是 $O(nm(n+m))$，无法承受。

预处理两个一维前缀和数组即可：

- $\mathrm{rowSum}[i] = \sum_k A_{i,k}$：第 $i$ 行的元素和；
- $\mathrm{colSum}[j] = \sum_k A_{k,j}$：第 $j$ 列的元素和。

读入时顺便累加：每读入一个 $A_{i,j}$，累加到 $\mathrm{rowSum}[i]$ 与 $\mathrm{colSum}[j]$。随后对每个 $(i,j)$ 输出 $\mathrm{rowSum}[i] + \mathrm{colSum}[j] - A_{i,j}$。

注意值域：单个行列和最大为 $2000 \times 10^9 = 2 \times 10^{12}$，$B$ 最大约 $4 \times 10^{12}$，超出 32 位整数范围，需要用 64 位整数。

## 复杂度

- 时间：读入 $O(nm)$，输出 $O(nm)$，总计 $O(nm)$。
- 空间：$O(nm)$ 存储网格 $A$，另需 $O(n+m)$ 存行列和。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let m = first[1]
    let nn = n
    let mm = m
    var a = Array<Array<Int64>>(nn, { _ => Array<Int64>(mm, { _ => 0 }) })
    let rowSum = Array<Int64>(nn, { _ => 0 })
    let colSum = Array<Int64>(mm, { _ => 0 })
    for (i in 0..nn) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        var rs = Int64(0)
        for (j in 0..mm) {
            a[i][j] = line[j]
            rs += line[j]
            colSum[j] += line[j]
        }
        rowSum[i] = rs
    }
    for (i in 0..nn) {
        for (j in 0..mm) {
            print(rowSum[i] + colSum[j] - a[i][j])
            if (j + 1 < mm) {
                print(" ")
            }
        }
        println()
    }
}
```

</details>
