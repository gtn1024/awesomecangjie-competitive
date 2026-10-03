---
oj: dmy
pid: '373'
title: '[R60A] 喝牛奶'
difficulty: 入门
tags:
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le x \le y \le 999$。

## 思路

每年长高 $0.4 = \frac{2}{5}$ 厘米，坚持 $t$ 年后身高为 $x + \frac{2}{5}t$，要求它不小于 $y$：

$$x + \frac{2}{5}t \ge y \iff 2t \ge 5(y-x)$$

所以

$$t = \left\lceil \frac{5(y-x)}{2} \right\rceil = \left\lfloor \frac{5(y-x)+1}{2} \right\rfloor$$

复杂度：时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let xy = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let d = xy[1] - xy[0]
    println((5 * d + 1) / 2)
}
```

</details>

要点：

- 向上取整 $\lceil p/2 \rceil$ 用整数运算写成 `(p + 1) / 2`，避免浮点误差。
- $x = y$ 时答案为 $0$（已经达标），公式自然给出。
