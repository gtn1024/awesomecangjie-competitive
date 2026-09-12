---
oj: dmy
pid: '306'
title: '[R49D]苹果和香蕉'
difficulty: 提高
tags:
  - BFS
  - 连通块
timeLimit: 1.5s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2000$，每个方格为 `a` 或 `b`。

## 思路

把网格看成一张图，每个方格是一个点，上下左右四连通且字符相同的两点相邻。同字符的四连通区域就是一块"连通田地"。题目要求对每个方格输出它所在连通块的周长。

**周长**定义为：连通块内每个方格的 4 条边中，邻接"异字符方格"或"出界"的边数之和。

直接的做法是：

1. 用 BFS（手写队列，避免 DFS 在 $n=2000$ 即 $4 \times 10^6$ 格上爆栈）遍历每个尚未访问的方格，找出整块连通区域。
2. 在 BFS 过程中顺手累加周长：对当前格的每个方向，若邻居出界或字符不同，周长加 $1$；否则若邻居同字符且未访问，则入队继续扩展。这样"异字符或出界"的判定同时承担了"加边"和"扩展"两件事，每个方向只判一次。
3. 块内每个方格的答案都设为这块的周长。

注意周长是整块的属性，与某个具体方格在块内的位置无关，所以块内所有方格输出同一个值。

## 复杂度

每个方格入队一次，每格判断 4 个方向，时间 $O(n^2)$；额外数组（`visited`、`ans`、`queue`）均为 $O(n^2)$。$n=2000$ 时格子数 $4 \times 10^6$，1.5s 内绰绰有余。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let grid = Array<String>(n, { _ => "" })
    var t = Int64(0)
    while (t < n) {
        grid[t] = reader.readln().getOrThrow()
        t++
    }
    let nn = n * n
    let visited = Array<UInt8>(nn, { _ => UInt8(0) })
    let ans = Array<Int32>(nn, { _ => Int32(0) })
    let queue = Array<Int32>(nn, { _ => Int32(0) })
    var i = Int64(0)
    while (i < n) {
        var j = Int64(0)
        while (j < n) {
            let start = i * n + j
            if (visited[start] != UInt8(0)) {
                j++
                continue
            }
            let ch: UInt8 = grid[i][j]
            var head = Int64(0)
            var tail = Int64(0)
            queue[tail] = Int32(start)
            tail++
            visited[start] = UInt8(1)
            var peri = Int64(0)
            while (head < tail) {
                let cur = Int64(queue[head])
                head++
                let ci = cur / n
                let cj = cur % n
                // up
                if (ci > 0) {
                    let ni = ci - 1
                    let nb = ni * n + cj
                    if (grid[ni][cj] != ch) {
                        peri++
                    } else if (visited[nb] == UInt8(0)) {
                        visited[nb] = UInt8(1)
                        queue[tail] = Int32(nb)
                        tail++
                    }
                } else {
                    peri++
                }
                // down
                if (ci < n - 1) {
                    let ni = ci + 1
                    let nb = ni * n + cj
                    if (grid[ni][cj] != ch) {
                        peri++
                    } else if (visited[nb] == UInt8(0)) {
                        visited[nb] = UInt8(1)
                        queue[tail] = Int32(nb)
                        tail++
                    }
                } else {
                    peri++
                }
                // left
                if (cj > 0) {
                    let nj = cj - 1
                    let nb = ci * n + nj
                    if (grid[ci][nj] != ch) {
                        peri++
                    } else if (visited[nb] == UInt8(0)) {
                        visited[nb] = UInt8(1)
                        queue[tail] = Int32(nb)
                        tail++
                    }
                } else {
                    peri++
                }
                // right
                if (cj < n - 1) {
                    let nj = cj + 1
                    let nb = ci * n + nj
                    if (grid[ci][nj] != ch) {
                        peri++
                    } else if (visited[nb] == UInt8(0)) {
                        visited[nb] = UInt8(1)
                        queue[tail] = Int32(nb)
                        tail++
                    }
                } else {
                    peri++
                }
            }
            var k = Int64(0)
            while (k < tail) {
                ans[Int64(queue[k])] = Int32(peri)
                k++
            }
            j++
        }
        i++
    }
    var ii = Int64(0)
    while (ii < n) {
        var jj = Int64(0)
        while (jj < n) {
            if (jj > 0) {
                print(" ")
            }
            print(ans[ii * n + jj])
            jj++
        }
        println()
        ii++
    }
}
```
