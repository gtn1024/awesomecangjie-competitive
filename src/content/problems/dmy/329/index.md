---
oj: dmy
pid: '329'
title: '[R53B] 接水'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^5$，$0 \le a_i \le b_i \le 10^9$。

## 思路

操作严格按照第 $1$ 个杯子到第 $n-1$ 个杯子的顺序进行，因此直接模拟每次倒水即可。

处理第 $i$ 次操作时，第 $i+1$ 个杯子的剩余容量为

$$
b_{i+1}-a_{i+1}。
$$

第 $i$ 个杯子最多能倒出 $a_i$ 毫升水，所以本次实际倒出的水量为

$$
x=\min(a_i,b_{i+1}-a_{i+1})。
$$

随后更新

$$
a_i\leftarrow a_i-x,\qquad a_{i+1}\leftarrow a_{i+1}+x。
$$

原地修改水量数组即可。轮到第 $i$ 个杯子向后倒水时，它从前一个杯子接到的水已经计入当前水量，因此该数组始终表示已经完成的操作之后各杯子的实际水量。

## 正确性证明

对操作编号进行归纳。开始处理第 $i$ 次操作前，假设数组记录的是前 $i-1$ 次操作结束后的真实水量。

第 $i$ 个杯子现有 $a_i$ 毫升水，第 $i+1$ 个杯子还能容纳 $b_{i+1}-a_{i+1}$ 毫升水。算法取二者的最小值 $x$，恰好满足“第 $i$ 个杯子倒空或第 $i+1$ 个杯子装满”时尽可能多地倒水。更新两个杯子的水量后，数组便与第 $i$ 次操作结束后的真实状态相同，其他杯子的水量没有变化。

归纳可知，完成全部 $n-1$ 次操作后，数组记录的就是所有杯子的最终水量，算法输出正确。

## 复杂度

时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

## 仓颉实现

```cangjie
import std.console.*
import std.convert.*

main() {
    let reader = Console.stdIn
    let n = Int64.parse(reader.readln().getOrThrow())
    let water = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let capacity = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    for (i in 0..(n - 1)) {
        let poured = min(water[i], capacity[i + 1] - water[i + 1])
        water[i] -= poured
        water[i + 1] += poured
    }

    for (i in 0..n) {
        if (i > 0) {
            print(" ")
        }
        print(water[i])
    }
    println()
}
```
