---
oj: dmy
pid: '168'
title: '[R28A]灯塔'
difficulty: 入门
tags:
  - 模拟
  - 几何
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le T \le 100$，$-10^9 \le x_1, y_1, x_2, y_2 \le 10^9$，且 $(x_1,y_1),(x_2,y_2)$ 均不为 $(0,0)$。

## 思路

两束光线分别沿向量 $(x_1, y_1)$ 与 $(x_2, y_2)$ 方向发射，它们在原点形成直角等价于这两个方向向量互相垂直，也就是点积为 $0$：

$$x_1 \times x_2 + y_1 \times y_2 = 0$$

直接读入每组数据计算即可。坐标绝对值最大为 $10^9$，点积的绝对值最大为 $2 \times 10^{18}$，在 `Int64` 范围内，无需担心溢出。

## 复杂度

时间 $O(T)$，空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..t) {
        let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let x1 = a[0]
        let y1 = a[1]
        let x2 = a[2]
        let y2 = a[3]
        if (x1 * x2 + y1 * y2 == 0) {
            println("Yes")
        } else {
            println("No")
        }
    }
}
```

</details>
