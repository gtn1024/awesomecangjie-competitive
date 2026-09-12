---
oj: dmy
pid: '217'
title: '[R36B]最大数字乘积'
difficulty: 普及
tags:
  - 枚举
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$3 \le n \le 1000$，$0 \le A_{i,j} \le 1000$。

## 思路

要找三个位置相邻且在同一直线上的数的最大乘积，直线方向共有四种：水平、竖直、左上到右下的对角线、右上到左下的对角线。

把每个位置 $(i, j)$ 都当作三个连续数中的第一个（最靠上或最靠左的那个），枚举四个方向各取连续两步即可：

- 水平：$(i, j) \to (i, j+1) \to (i, j+2)$，要求 $j+2 < n$；
- 竖直：$(i, j) \to (i+1, j) \to (i+2, j)$，要求 $i+2 < n$；
- 主对角线：$(i, j) \to (i+1, j+1) \to (i+2, j+2)$，要求 $i+2 < n$ 且 $j+2 < n$；
- 副对角线：$(i, j) \to (i+1, j-1) \to (i+2, j-2)$，要求 $i+2 < n$ 且 $j-2 \ge 0$。

对每个合法起点算出乘积，取所有乘积的最大值即可。

最大乘积不超过 $1000^3 = 10^9$，用 `Int64` 不会溢出。注意每个元素都非负，初始答案可设为 $0$。

## 复杂度

时间 $O(n^2)$（每个位置常数次乘法），空间 $O(n^2)$。$n = 1000$ 时约 $4 \times 10^6$ 次乘法，足够快。

## 仓颉实现

```cangjie
import std.console.*
import std.convert.*

main() {
    let reader = Console.stdIn
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = Array<Array<Int64>>(n, { _ =>
        reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    })
    var ans: Int64 = 0
    for (i in 0..n) {
        for (j in 0..n) {
            let v0 = a[i][j]
            // 水平：向右 (i, j) (i, j+1) (i, j+2)
            if (j + 2 < n) {
                let p = v0 * a[i][j + 1] * a[i][j + 2]
                if (p > ans) {
                    ans = p
                }
            }
            // 竖直：向下 (i, j) (i+1, j) (i+2, j)
            if (i + 2 < n) {
                let p = v0 * a[i + 1][j] * a[i + 2][j]
                if (p > ans) {
                    ans = p
                }
            }
            // 左上到右下对角线：(i, j) (i+1, j+1) (i+2, j+2)
            if (i + 2 < n && j + 2 < n) {
                let p = v0 * a[i + 1][j + 1] * a[i + 2][j + 2]
                if (p > ans) {
                    ans = p
                }
            }
            // 右上到左下对角线：(i, j) (i+1, j-1) (i+2, j-2)
            if (i + 2 < n && j - 2 >= 0) {
                let p = v0 * a[i + 1][j - 1] * a[i + 2][j - 2]
                if (p > ans) {
                    ans = p
                }
            }
        }
    }
    println(ans)
}
```
