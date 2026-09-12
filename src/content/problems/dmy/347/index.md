---
oj: dmy
pid: '347'
title: '[R55G]数数场'
difficulty: 省选
tags:
  - 动态规划
  - 矩阵
  - 线段树
timeLimit: 3s
memoryLimit: 1024m
---

> 数据规模：$1 \le n,q \le 5 \times 10^4$，$1 \le k \le 5$，$1 \le a_{i,j},t \le 10^9$。

## 思路

先考虑没有修改时如何计数。令 $f_{i,s}$ 表示已经确定前 $i$ 道题，且末尾恰好连续出现了 $s$ 道数数题的所有方案的不满意度之和，其中 $0 \le s \le k$。第 $i$ 道题不是数数题时，连续计数会清零；它是当前连续出现的第 $s$ 道数数题时，权值会乘上 $a_{i,s}$。因此有

$$
f_{i,0}=\sum_{s=0}^{k}f_{i-1,s},
\qquad
f_{i,s}=a_{i,s}f_{i-1,s-1}\quad(1\le s\le k).
$$

把这些状态写成列向量 $F_i=(f_{i,0},f_{i,1},\ldots,f_{i,k})^{\mathsf T}$，上面的转移可以表示为

$$
F_i=M_iF_{i-1},
\qquad
M_i=
\begin{pmatrix}
1&1&1&\cdots&1\\
a_{i,1}&0&0&\cdots&0\\
0&a_{i,2}&0&\cdots&0\\
\vdots&\ddots&\ddots&\ddots&\vdots\\
0&\cdots&0&a_{i,k}&0
\end{pmatrix}.
$$

初始向量为 $F_0=(1,0,\ldots,0)^{\mathsf T}$，于是

$$
F_n=M_nM_{n-1}\cdots M_1F_0.
$$

最终连续数数题数量可以是 $0$ 到 $k$ 中的任意值，所以答案是 $F_n$ 所有分量之和，也就是矩阵乘积第一列所有元素之和。

每次修改 $a_{i,j}$ 时，只会改变矩阵 $M_i$ 的第 $j$ 行、第 $j-1$ 列。用线段树维护矩阵乘积：若一个节点的左、右儿子分别维护 $P_L$ 和 $P_R$，由于靠右的位置后执行转移，该节点维护的乘积应为

$$
P_RP_L.
$$

修改一个叶子后，自底向上重新计算到根的所有矩阵即可。补到二次幂的空叶子放单位矩阵，不会影响总乘积。

矩阵阶数最多为 $6$。实现中把所有矩阵按行展开到一个一维数组中；计算矩阵的一个元素时，至多累加 $6$ 个小于模数平方的乘积，仍在 `Int64` 范围内，因此可以累加完后只取一次模。

## 复杂度

记 $d=k+1$。建树时间为 $O(nd^3)$，每次修改时间为 $O(d^3\log n)$，总时间为 $O(nd^3+qd^3\log n)$；空间复杂度为 $O(nd^2)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

const MOD: Int64 = 998244353

func multiply(tree: Array<Int64>, target: Int64, left: Int64, right: Int64, dimension: Int64, cells: Int64) {
    let targetBase = target * cells
    let leftBase = left * cells
    let rightBase = right * cells
    var row: Int64 = 0
    while (row < dimension) {
        let targetRow = targetBase + row * dimension
        let leftRow = leftBase + row * dimension
        var column: Int64 = 0
        while (column < dimension) {
            var value: Int64 = 0
            var middle: Int64 = 0
            while (middle < dimension) {
                value += tree[leftRow + middle] * tree[rightBase + middle * dimension + column]
                middle += 1
            }
            tree[targetRow + column] = value % MOD
            column += 1
        }
        row += 1
    }
}

main() {
    let reader = getStdIn()
    let firstLine = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = firstLine[0]
    let k = firstLine[1]
    let dimension = k + 1
    let cells = dimension * dimension

    var size: Int64 = 1
    while (size < n) {
        size *= 2
    }
    let treeLength = size * 2 * cells
    let tree = Array<Int64>(treeLength, { _ => 0 })

    var position: Int64 = 0
    while (position < n) {
        let values = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let base = (size + position) * cells
        var column: Int64 = 0
        while (column < dimension) {
            tree[base + column] = 1
            column += 1
        }
        var runLength: Int64 = 1
        while (runLength <= k) {
            tree[base + runLength * dimension + runLength - 1] = values[runLength - 1] % MOD
            runLength += 1
        }
        position += 1
    }

    position = n
    while (position < size) {
        let base = (size + position) * cells
        var diagonal: Int64 = 0
        while (diagonal < dimension) {
            tree[base + diagonal * dimension + diagonal] = 1
            diagonal += 1
        }
        position += 1
    }

    var node = size - 1
    while (node > 0) {
        multiply(tree, node, node * 2 + 1, node * 2, dimension, cells)
        node -= 1
    }

    let q = Int64.parse(reader.readln().getOrThrow())
    var query: Int64 = 0
    while (query < q) {
        let update = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let index = update[0] - 1
        let runLength = update[1]
        node = size + index
        let leafBase = node * cells
        tree[leafBase + runLength * dimension + runLength - 1] = update[2] % MOD

        node /= 2
        while (node > 0) {
            multiply(tree, node, node * 2 + 1, node * 2, dimension, cells)
            node /= 2
        }

        var total: Int64 = 0
        var state: Int64 = 0
        while (state < dimension) {
            total += tree[cells + state * dimension]
            state += 1
        }
        println(total % MOD)
        query += 1
    }
}
```
