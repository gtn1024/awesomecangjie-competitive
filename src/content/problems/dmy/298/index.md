---
oj: dmy
pid: '298'
title: '[R48C]工厂生产'
difficulty: 普及
tags:
  - 矩阵乘法
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1 \le n \le 100$，$1 \le a_{i, j}, b_{j, l} \le 100$。

## 思路

把产品对零件的消耗表 $a$ 与零件对原料的消耗表 $b$ 都看作 $n \times n$ 矩阵。生产 $1$ 个「产品 $i$」需要的「原料 $l$」总数，等于把所有零件 $j$ 的消耗量乘上该零件对原料 $l$ 的消耗量后求和：

$$c_{i, l} = \sum_{j=1}^{n} a_{i, j} \cdot b_{j, l}$$

这正是矩阵乘法 $c = a \times b$，直接套用三重循环计算即可。

## 复杂度

- 时间：$O(n^3)$，$n \le 100$ 时约为 $10^6$ 次运算。
- 空间：$O(n^2)$，存储三个 $n \times n$ 矩阵。
- 数值：单个 $c_{i, l}$ 最大为 $n \times 100 \times 100 = 10^6$，`Int64` 完全安全。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let nn = n
    // 读入矩阵 a：n 行，每行 n 个整数
    var a = Array<Array<Int64>>(nn, { _ =>
        reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    })
    // 读入矩阵 b：n 行，每行 n 个整数
    var b = Array<Array<Int64>>(nn, { _ =>
        reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    })
    // 矩阵乘法 c = a * b
    for (i in 0..nn) {
        for (l in 0..nn) {
            var sum: Int64 = 0
            for (j in 0..nn) {
                sum += a[i][j] * b[j][l]
            }
            print(sum)
            if (l + 1 < nn) {
                print(" ")
            }
        }
        println()
    }
}
```

</details>
