---
oj: dmy
pid: '489'
title: '[R79B] 砝码'
difficulty: 入门
tags:
  - 枚举
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$2 \le n \le 300$，$1 \le w \le 10^9$，$1 \le a_i \le 10^9$。

## 思路

$n \le 300$，两两组合只有约 $\frac{300 \times 299}{2} \approx 4.5$ 万对，直接 **O(n²) 枚举**所有编号对 $i < j$ 即可。

对每个总重量 $s = a_i + a_j$ 计算误差 $|s - w|$，维护最优值：误差更小则更新；误差相等时取更小的 $s$。注意题目要求的是 **编号不同**，与重量是否相同无关——两个重量相同的砝码只要编号不同就可以同时选（样例 2），所以枚举时不要对重量去重。

也可以用排序 + 双指针做到 O(n log n)，但数据范围下没有必要，枚举反而更不易错。

## 复杂度

- 时间复杂度：O(n²)，约 4.5 万次枚举。
- 空间复杂度：O(n)，存放重量数组。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let line1 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = line1[0]
    let w = line1[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    var bestS = a[0] + a[1]
    var bestErr = bestS - w
    if (bestErr < 0) {
        bestErr = -bestErr
    }
    for (i in 0..n) {
        for (j in (i + 1)..n) {
            let s = a[i] + a[j]
            var err = s - w
            if (err < 0) {
                err = -err
            }
            if (err < bestErr || (err == bestErr && s < bestS)) {
                bestErr = err
                bestS = s
            }
        }
    }
    println(bestS)
}
```
